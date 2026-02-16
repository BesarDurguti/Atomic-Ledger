import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createTransactionSchema } from "@/lib/validation"

// GET /api/transactions — list all transactions (supports ?month= and ?category= filters)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const month = searchParams.get("month") // format: "2026-02"
  const category = searchParams.get("category") // category id

  const where: Record<string, unknown> = {}

  if (month) {
    const [year, m] = month.split("-").map(Number)
    const start = new Date(year, m - 1, 1)
    const end = new Date(year, m, 1)
    where.date = { gte: start, lt: end }
  }

  if (category) {
    where.OR = [
      { fromCategoryId: category },
      { toCategoryId: category },
    ]
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
    include: {
      fromCategory: true,
      toCategory: true,
    },
  })

  return NextResponse.json(transactions)
}

// POST /api/transactions — create a new transaction
export async function POST(request: Request) {
  const body = await request.json()

  const result = createTransactionSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  // Verify both categories exist
  const [fromCategory, toCategory] = await Promise.all([
    prisma.category.findUnique({ where: { id: result.data.fromCategoryId } }),
    prisma.category.findUnique({ where: { id: result.data.toCategoryId } }),
  ])

  if (!fromCategory) {
    return NextResponse.json({ error: "From category not found" }, { status: 400 })
  }
  if (!toCategory) {
    return NextResponse.json({ error: "To category not found" }, { status: 400 })
  }

  const transaction = await prisma.transaction.create({
    data: {
      description: result.data.description,
      amount: result.data.amount,
      fromCategoryId: result.data.fromCategoryId,
      toCategoryId: result.data.toCategoryId,
      date: new Date(result.data.date),
      aiGenerated: result.data.aiGenerated,
    },
    include: {
      fromCategory: true,
      toCategory: true,
    },
  })

  return NextResponse.json(transaction, { status: 201 })
}
