import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createCategorySchema } from "@/lib/validation"

// GET /api/categories — list all categories
export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: {
          transactionsFrom: true,
          transactionsTo: true,
        },
      },
    },
  })

  return NextResponse.json(categories)
}

// POST /api/categories — create a new category
export async function POST(request: Request) {
  const body = await request.json()

  const result = createCategorySchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const category = await prisma.category.create({
    data: result.data,
  })

  return NextResponse.json(category, { status: 201 })
}
