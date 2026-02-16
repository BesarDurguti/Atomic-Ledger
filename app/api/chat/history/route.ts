import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/lib/auth"

// GET /api/chat/history — load previous chat messages
export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const messages = await prisma.message.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true },
  })

  return NextResponse.json(messages)
}
