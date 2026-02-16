import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/lib/auth"
import { updateCategorySchema } from "@/lib/validation"
import { invalidateCache } from "@/lib/ai-tools"

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

  // Verify category belongs to user and is not deleted
  const existing = await prisma.category.findFirst({
    where: { id, userId, deletedAt: null },
  })
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 })
  }

  const category = await prisma.category.update({
    where: { id },
    data: result.data,
  })

  invalidateCache(userId)
  return NextResponse.json(category)
}

// DELETE /api/categories/[id] — soft delete a category
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
    where: { id, userId, deletedAt: null },
  })

  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 })
  }

  await prisma.category.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  invalidateCache(userId)
  return NextResponse.json({ success: true })
}
