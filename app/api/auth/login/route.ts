import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createHash } from "crypto"
import { prisma } from "@/lib/prisma"

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || user.password !== hashPassword(password)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }

  // Set session cookie with user ID
  const cookieStore = await cookies()
  cookieStore.set("session", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return NextResponse.json({ id: user.id, name: user.name, email: user.email })
}
