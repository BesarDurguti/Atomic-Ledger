import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createHash } from "crypto"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validation"

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

export async function POST(request: Request) {
  const body = await request.json()

  const result = registerSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { name, email, password } = result.data

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 409 }
    )
  }

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword(password),
    },
  })

  // Auto-login after register
  const cookieStore = await cookies()
  cookieStore.set("session", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  return NextResponse.json(
    { id: user.id, name: user.name, email: user.email },
    { status: 201 }
  )
}
