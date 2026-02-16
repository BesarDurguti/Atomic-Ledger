import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/lib/auth"
import { createCategorySchema } from "@/lib/validation"

// GET /api/categories — list all categories for the logged-in user
export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const categories = await prisma.category.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(categories)
}

// POST /api/categories — create a new category
export async function POST(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const result = createCategorySchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const category = await prisma.category.create({
    data: {
      name: result.data.name,
      type: result.data.type,
      userId,
    },
  })

  return NextResponse.json(category, { status: 201 })
}
