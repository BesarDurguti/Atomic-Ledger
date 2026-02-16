import { NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  const session = request.cookies.get("session")
  const path = request.nextUrl.pathname
  const isAuthPage = path === "/login" || path === "/register"
  const isLandingPage = path === "/"

  // Landing page: logged-in users go to dashboard
  if (isLandingPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Landing page: unauthenticated users can view it
  if (isLandingPage) {
    return NextResponse.next()
  }

  // Not logged in and not on auth page → redirect to login
  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Logged in and on auth page → redirect to dashboard
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon-no-bg.png).*)",
  ],
}
