import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/lib/auth"
import { updateTransactionSchema } from "@/lib/validation"

// PUT /api/transactions/[id] — update a transaction
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const result = updateTransactionSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const existing = await prisma.transaction.findFirst({
    where: { id, userId, deletedAt: null },
  })
  if (!existing) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
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

  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      description: result.data.description,
      amount: result.data.amount,
      fromCategoryId: result.data.fromCategoryId,
      toCategoryId: result.data.toCategoryId,
      date: new Date(result.data.date),
    },
    include: {
      fromCategory: { select: { id: true, name: true, type: true } },
      toCategory: { select: { id: true, name: true, type: true } },
    },
  })

  return NextResponse.json(transaction)
}

// DELETE /api/transactions/[id] — delete a transaction
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.transaction.findFirst({
    where: { id, userId, deletedAt: null },
  })

  if (!existing) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
  }

  await prisma.transaction.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ success: true })
}
