import { cookies } from "next/headers"

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")
  return session?.value ?? null
}
