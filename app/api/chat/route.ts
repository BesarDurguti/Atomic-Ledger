import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { tools, executeTool, getUserFinancialData } from "@/lib/ai-tools";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

async function buildSystemPrompt(userId: string) {
  const data = await getUserFinancialData(userId);

  const categoryList = data.categories
    .map((c) => `  - ${c.name} (${c.type})`)
    .join("\n");

  const breakdownText = data.breakdown
    .map(({ name, amount }) => `  - ${name}: €${amount.toFixed(2)}`)
    .join("\n");

  const recentTxText = data.transactions
    .slice(0, 10)
    .map(
      (t) =>
        `  - ${new Date(t.date).toLocaleDateString()}: "${t.description}" — €${t.amount.toFixed(2)} (${t.fromCategory.name} → ${t.toCategory.name})`,
    )
    .join("\n");

  return `You are the personal finance assistant for Atomic Ledger, an AI-powered double-entry bookkeeping app. You are like the user's personal accountant.

CURRENT FINANCIAL DATA (use this to answer questions directly — no need to call get_financial_summary):

Categories:
${categoryList || "  No categories yet."}

Total Transactions: ${data.transactions.length}
Total Income: €${data.totalIncome.toFixed(2)}
Total Spent on Expenses: €${data.totalSpent.toFixed(2)}

Expense Breakdown:
${breakdownText || "  No expenses yet."}

Recent Transactions (last 10):
${recentTxText || "  No transactions yet."}

TOOLS:
- **create_category**: ONLY call this when the user wants to add a new category. Categories have 4 types: ASSET (where money is stored), EXPENSE (where money goes), REVENUE (where money comes from), LIABILITY (money owed).
- **delete_category**: Call this when the user wants to remove/delete a category. Uses soft delete so transaction history is preserved.
- **create_transaction**: Call this when the user describes a payment, expense, or income. Every transaction moves money FROM one category TO another (double-entry). Mark it with today's date unless the user specifies otherwise. The transaction will be flagged as AI-generated.
- **get_financial_summary**: ONLY call this if you think the data above might be outdated (e.g., user says they just added something). For normal questions, use the data above directly.

INSTRUCTIONS:
- Answer financial questions using the data above — do NOT call get_financial_summary unless necessary
- Be conversational and friendly
- Use € as the currency
- If the user writes in Albanian, respond in Albanian
- Keep responses concise but informative
- Never make up numbers — only use the real data provided
- When creating categories, confirm what was created
- If there's no data yet, encourage the user to start recording transactions`;
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const { message, history } = await request.json();

  if (!message || typeof message !== "string") {
    return new Response(JSON.stringify({ error: "Message is required" }), {
      status: 400,
    });
  }

  const chatHistory = (history ?? []).map(
    (msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }),
  );

  try {
    const systemPrompt = await buildSystemPrompt(userId);

    // First call — may return text or tool calls
    let response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [...chatHistory, { role: "user", parts: [{ text: message }] }],
      config: {
        systemInstruction: systemPrompt,
        tools,
      },
    });

    // Handle tool calls in a loop (model may call multiple tools in sequence)
    const contents = [
      ...chatHistory,
      { role: "user", parts: [{ text: message }] },
    ];

    while (response.functionCalls && response.functionCalls.length > 0) {
      const functionCalls = response.functionCalls;

      // Preserve the raw model response (includes thought signatures)
      const candidate = response.candidates?.[0];
      if (candidate?.content) {
        contents.push(candidate.content);
      }

      // Execute all function calls
      const functionResponses = [];
      for (const fc of functionCalls) {
        const result = await executeTool(
          fc.name!,
          (fc.args ?? {}) as Record<string, string>,
          userId,
        );
        functionResponses.push({
          functionResponse: { name: fc.name, response: JSON.parse(result) },
        });
      }

      // Add function results to contents
      contents.push({ role: "user", parts: functionResponses });

      // Get next response (may be text or more tool calls)
      response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents,
        config: {
          systemInstruction: systemPrompt,
          tools,
        },
      });
    }

    // Now we have a text response
    const finalText = response.text ?? "";

    // Save messages to database
    await prisma.message.createMany({
      data: [
        { role: "USER", content: message, userId },
        { role: "ASSISTANT", content: finalText, userId },
      ],
    });

    // Stream the text to the client word-by-word for smooth UI
    const encoder = new TextEncoder();
    const words = finalText.split(/(\s+)/);
    const stream = new ReadableStream({
      async start(controller) {
        for (const word of words) {
          controller.enqueue(encoder.encode(word));
          await new Promise((r) => setTimeout(r, 15));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Gemini API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get AI response" }),
      { status: 500 },
    );
  }
}
