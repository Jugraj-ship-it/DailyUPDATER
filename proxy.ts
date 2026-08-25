import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Uses the Edge-compatible config (no Prisma/bcrypt) since this runs in the
// Edge runtime. Defense in depth: pages already redirect unauthenticated
// users themselves; this catches anything that slips through as routes get added.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isAuth = !!req.auth;
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/signup") ||
    req.nextUrl.pathname.startsWith("/forgot-password") ||
    req.nextUrl.pathname.startsWith("/reset-password");

  if (!isAuth && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
