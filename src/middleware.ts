import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from 'jose';

export async function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("naura_auth");
  const { pathname } = request.nextUrl;

  // Public paths
  if (pathname === "/" || pathname === "/locked" || pathname === "/api/auth/unlock") {
    return NextResponse.next();
  }

  // Protected paths
  let isAuthenticated = false;
  if (authCookie) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key");
      await jose.jwtVerify(authCookie.value, secret);
      isAuthenticated = true;
    } catch (error) {
      console.error("Middleware auth error:", error);
    }
  }

  if (!isAuthenticated) {
    // If it's an API route, return 401
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Otherwise redirect to landing
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
