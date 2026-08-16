import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/manifest")
  ) {
    return NextResponse.next();
  }

  // Check secure login cookie
  const loggedIn = request.cookies.get(
    "kgvoa_logged_in"
  );

  // Not logged in
  if (!loggedIn) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  // Logged in
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/login).*)",
  ],
};