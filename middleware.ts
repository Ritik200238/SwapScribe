import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  // 1. Check if the user is trying to access a protected route
  const isDashboardRoute = path.startsWith("/dashboard");
  const isAuthRoute = path.startsWith("/login") || path.startsWith("/signup");

  // 2. Get the session cookie
  const cookie = request.cookies.get("session");
  
  let session = null;
  if (cookie) {
    try {
      session = await verifySession(cookie.value);
    } catch (e) {
      console.error("Middleware session verification failed:", e);
    }
  }

  // console.log(`[Middleware] Path: ${path}, Cookie: ${!!cookie}, Session: ${!!session}`);

  // 3. Redirect logic
  // If user is on dashboard but not authenticated -> Login
  if (isDashboardRoute && !session) {
    // console.log("[Middleware] Redirecting unauth user to /login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is on login/signup but IS authenticated -> Dashboard
  if (isAuthRoute && session) {
    // console.log("[Middleware] Redirecting auth user to /dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};