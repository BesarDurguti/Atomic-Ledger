import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/lib/auth"

const PAGE_SIZE = 20

// GET /api/chat/history?cursor=<id> — load paginated chat messages (newest first)
export async function GET(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get("cursor")

  const messages = await prisma.message.findMany({
    where: { userId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: PAGE_SIZE + 1, // fetch one extra to check if there are more
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1, // skip the cursor itself
        }
      : {}),
    select: { id: true, role: true, content: true, createdAt: true },
  })

  const hasMore = messages.length > PAGE_SIZE
  if (hasMore) messages.pop()

  // Reverse to chronological order for the client
  messages.reverse()

  return NextResponse.json({
    messages,
    hasMore,
    nextCursor: hasMore ? messages[0]?.id : null,
  })
}
