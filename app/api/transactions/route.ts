import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/lib/auth"
import { createTransactionSchema } from "@/lib/validation"

// GET /api/transactions — list all transactions for the logged-in user
export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId, deletedAt: null },
    orderBy: { date: "desc" },
    include: {
      fromCategory: { select: { id: true, name: true, type: true } },
      toCategory: { select: { id: true, name: true, type: true } },
    },
  })

  return NextResponse.json(transactions)
}

// POST /api/transactions — create a new transaction
export async function POST(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const result = createTransactionSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  // Verify both categories belong to the user and are active
  const [fromCat, toCat] = await Promise.all([
    prisma.category.findFirst({
      where: { id: result.data.fromCategoryId, userId, deletedAt: null },
    }),
    prisma.category.findFirst({
      where: { id: result.data.toCategoryId, userId, deletedAt: null },
    }),
  ])

  if (!fromCat) {
    return NextResponse.json({ error: "From category not found" }, { status: 400 })
  }
  if (!toCat) {
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
      userId,
    },
    include: {
      fromCategory: { select: { id: true, name: true, type: true } },
      toCategory: { select: { id: true, name: true, type: true } },
    },
  })

  return NextResponse.json(transaction, { status: 201 })
}
