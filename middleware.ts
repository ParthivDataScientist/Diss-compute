import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Session } from "@/lib/auth/types";

const COOKIE_NAME = "circuit_crm_session";
const PUBLIC_PATHS = ["/login", "/forgot-password"];
const ADMIN_ONLY = ["/analytics", "/admin"];

function decodeSession(encoded: string): Session | null {
  try {
    // Use atob — edge runtime compatible (no Buffer)
    const json = atob(encoded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow Next.js internals & static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  const isPublicPath = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"));

  const sessionCookie = request.cookies.get(COOKIE_NAME);
  const session = sessionCookie ? decodeSession(sessionCookie.value) : null;

  // Not logged in → redirect to login (unless on public path)
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Logged in + visiting login → redirect home
  if (session && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Admin-only route check
  if (session && ADMIN_ONLY.some(p => pathname.startsWith(p))) {
    if (session.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
