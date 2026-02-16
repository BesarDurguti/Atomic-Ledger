import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/lib/auth"

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get all active transactions with categories
  const transactions = await prisma.transaction.findMany({
    where: { userId, deletedAt: null },
    orderBy: { date: "desc" },
    include: {
      fromCategory: { select: { name: true, type: true } },
      toCategory: { select: { name: true, type: true } },
    },
  })

  const totalTransactions = transactions.length
  const aiGenerated = transactions.filter(t => t.aiGenerated).length

  // Total spent = sum of amounts where toCategory is EXPENSE
  const totalSpent = transactions
    .filter(t => t.toCategory.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0)

  // Spending breakdown by expense category
  const breakdownMap = new Map<string, number>()
  for (const t of transactions) {
    if (t.toCategory.type === "EXPENSE") {
      const current = breakdownMap.get(t.toCategory.name) ?? 0
      breakdownMap.set(t.toCategory.name, current + t.amount)
    }
  }

  const breakdown = Array.from(breakdownMap.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)

  // Recent 5 transactions
  const recent = transactions.slice(0, 5).map(t => ({
    id: t.id,
    description: t.description,
    amount: t.amount,
    from: t.fromCategory.name,
    to: t.toCategory.name,
    date: t.date,
    aiGenerated: t.aiGenerated,
  }))

  return NextResponse.json({
    totalTransactions,
    totalSpent,
    aiGenerated,
    breakdown,
    recent,
  })
}
