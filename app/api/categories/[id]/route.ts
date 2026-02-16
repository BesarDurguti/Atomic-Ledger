import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { updateCategorySchema } from "@/lib/validation"

// PUT /api/categories/[id] — update a category
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const result = updateCategorySchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const existing = await prisma.category.findUnique({ where: { id } })
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
  const { id } = await params

  const existing = await prisma.category.findUnique({
    where: { id },
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
      { error: `Cannot delete category with ${totalTransactions} transaction(s). Remove them first.` },
      { status: 400 }
    )
  }

  await prisma.category.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
