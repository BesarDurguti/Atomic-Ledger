import { Type, type Tool } from "@google/genai";
import { prisma } from "@/lib/prisma";

// ─── Cache ───────────────────────────────────────────────────────────────────

interface UserFinancialData {
  categories: { id: string; name: string; type: string }[];
  transactions: {
    id: string;
    description: string;
    amount: number;
    date: Date;
    fromCategory: { name: string; type: string };
    toCategory: { name: string; type: string };
  }[];
  totalSpent: number;
  totalIncome: number;
  breakdown: { name: string; amount: number }[];
}

const userDataCache = new Map<
  string,
  { data: UserFinancialData; timestamp: number }
>();
const CACHE_TTL = 30 * 60_000; // 30 minutes

export async function getUserFinancialData(
  userId: string,
): Promise<UserFinancialData> {
  const cached = userDataCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const [categories, transactions] = await Promise.all([
    prisma.category.findMany({
      where: { userId, deletedAt: null },
      select: { id: true, name: true, type: true },
    }),
    prisma.transaction.findMany({
      where: { userId, deletedAt: null },
      orderBy: { date: "desc" },
      include: {
        fromCategory: { select: { name: true, type: true } },
        toCategory: { select: { name: true, type: true } },
      },
    }),
  ]);

  const totalSpent = transactions
    .filter((t) => t.toCategory.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter((t) => t.fromCategory.type === "REVENUE")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseMap = new Map<string, number>();
  for (const t of transactions) {
    if (t.toCategory.type === "EXPENSE") {
      const current = expenseMap.get(t.toCategory.name) ?? 0;
      expenseMap.set(t.toCategory.name, current + t.amount);
    }
  }

  const breakdown = Array.from(expenseMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => ({ name, amount }));

  const data: UserFinancialData = {
    categories,
    transactions,
    totalSpent,
    totalIncome,
    breakdown,
  };

  userDataCache.set(userId, { data, timestamp: Date.now() });
  return data;
}

export function invalidateCache(userId: string) {
  userDataCache.delete(userId);
}

// ─── Tool Definitions ────────────────────────────────────────────────────────

export const tools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "create_category",
        description:
          "Create a new financial category for the user. Use this when the user asks to add a new category for tracking their finances.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description:
                "The name of the category (e.g., Groceries, Gym, Netflix)",
            },
            type: {
              type: Type.STRING,
              enum: ["ASSET", "LIABILITY", "REVENUE", "EXPENSE"],
              description:
                "The category type: ASSET (where money is stored), EXPENSE (where money goes), REVENUE (where money comes from), LIABILITY (money owed)",
            },
          },
          required: ["name", "type"],
        },
      },
      {
        name: "delete_category",
        description:
          "Delete (soft delete) a financial category by name. Use this when the user asks to remove or delete a category.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "The exact name of the category to delete",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "create_transaction",
        description:
          "Create a new transaction. Every transaction moves money FROM one category TO another (double-entry). Use this when the user describes a payment, expense, income, or any money movement.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            description: {
              type: Type.STRING,
              description: "A short description of the transaction (e.g., 'Paid rent for February')",
            },
            amount: {
              type: Type.NUMBER,
              description: "The amount in euros",
            },
            fromCategory: {
              type: Type.STRING,
              description: "The name of the source category (where money comes FROM)",
            },
            toCategory: {
              type: Type.STRING,
              description: "The name of the destination category (where money goes TO)",
            },
            date: {
              type: Type.STRING,
              description: "The date of the transaction in YYYY-MM-DD format. Use today's date if not specified.",
            },
          },
          required: ["description", "amount", "fromCategory", "toCategory", "date"],
        },
      },
      {
        name: "get_financial_summary",
        description:
          "Get the user's complete and up-to-date financial data including all categories, transactions, income, expenses, and spending breakdown. Use this when the user asks about their finances, spending, income, or wants analysis.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
    ],
  },
];

// ─── Tool Executor ───────────────────────────────────────────────────────────

export async function executeTool(
  name: string,
  args: Record<string, string>,
  userId: string,
): Promise<string> {
  switch (name) {
    case "create_category": {
      const { name: catName, type: catType } = args;

      const existing = await prisma.category.findFirst({
        where: { userId, name: catName, deletedAt: null },
      });
      if (existing) {
        return JSON.stringify({
          success: false,
          error: `Category "${catName}" already exists as a ${existing.type} category.`,
        });
      }

      const category = await prisma.category.create({
        data: { name: catName, type: catType, userId },
      });

      invalidateCache(userId);

      return JSON.stringify({
        success: true,
        category: {
          id: category.id,
          name: category.name,
          type: category.type,
        },
      });
    }

    case "delete_category": {
      const { name: catName } = args;

      const existing = await prisma.category.findFirst({
        where: { userId, name: catName, deletedAt: null },
      });
      if (!existing) {
        return JSON.stringify({
          success: false,
          error: `Category "${catName}" not found.`,
        });
      }

      await prisma.category.update({
        where: { id: existing.id },
        data: { deletedAt: new Date() },
      });

      invalidateCache(userId);

      return JSON.stringify({
        success: true,
        deleted: { name: existing.name, type: existing.type },
      });
    }

    case "create_transaction": {
      const { description: desc, amount, fromCategory: fromName, toCategory: toName, date } = args;

      // Find categories by name
      const [fromCat, toCat] = await Promise.all([
        prisma.category.findFirst({
          where: { userId, name: fromName, deletedAt: null },
        }),
        prisma.category.findFirst({
          where: { userId, name: toName, deletedAt: null },
        }),
      ]);

      if (!fromCat) {
        return JSON.stringify({
          success: false,
          error: `Category "${fromName}" not found. Available categories: ${(await prisma.category.findMany({ where: { userId, deletedAt: null }, select: { name: true } })).map(c => c.name).join(", ")}`,
        });
      }
      if (!toCat) {
        return JSON.stringify({
          success: false,
          error: `Category "${toName}" not found. Available categories: ${(await prisma.category.findMany({ where: { userId, deletedAt: null }, select: { name: true } })).map(c => c.name).join(", ")}`,
        });
      }
      if (fromCat.id === toCat.id) {
        return JSON.stringify({
          success: false,
          error: "From and To categories must be different.",
        });
      }

      const transaction = await prisma.transaction.create({
        data: {
          description: desc,
          amount: parseFloat(amount),
          fromCategoryId: fromCat.id,
          toCategoryId: toCat.id,
          date: new Date(date),
          aiGenerated: true,
          userId,
        },
      });

      invalidateCache(userId);

      return JSON.stringify({
        success: true,
        transaction: {
          id: transaction.id,
          description: transaction.description,
          amount: transaction.amount,
          from: fromName,
          to: toName,
          date,
        },
      });
    }

    case "get_financial_summary": {
      const data = await getUserFinancialData(userId);

      return JSON.stringify({
        categories: data.categories.map((c) => ({
          name: c.name,
          type: c.type,
        })),
        totalTransactions: data.transactions.length,
        totalIncome: data.totalIncome,
        totalSpent: data.totalSpent,
        expenseBreakdown: data.breakdown,
        recentTransactions: data.transactions.slice(0, 10).map((t) => ({
          description: t.description,
          amount: t.amount,
          date: new Date(t.date).toLocaleDateString(),
          from: t.fromCategory.name,
          to: t.toCategory.name,
        })),
      });
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}
