import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/lib/auth"
import { updateCategorySchema } from "@/lib/validation"

// PUT /api/categories/[id] — update a category
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

  const result = updateCategorySchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  // Verify category belongs to user
  const existing = await prisma.category.findFirst({
    where: { id, userId },
  })
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 })
  }

  const category = await prisma.category.update({
    where: { id },
    data: result.data,
  })

  return NextResponse.json(category)
}

// DELETE /api/categories/[id] — delete a category (only if no transactions)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.category.findFirst({
    where: { id, userId },
    include: {
      _count: {
        select: {
          transactionsFrom: true,
          transactionsTo: true,
        },
      },
    },
  })

  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 })
  }

  const totalTransactions = existing._count.transactionsFrom + existing._count.transactionsTo
  if (totalTransactions > 0) {
    return NextResponse.json(
      { error: `Cannot delete category with ${totalTransactions} transaction(s)` },
      { status: 400 }
    )
  }

  await prisma.category.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
