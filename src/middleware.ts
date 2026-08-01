import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Decode a JWT token payload without verifying the signature.
 * Verification happens on the backend; we only need the role for routing.
 */
function decodeToken(token: string): { userId: string; role: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // Base64url → base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ─── Route definitions ───────────────────────────────────────────────────────

/** Routes that require no authentication. */
const publicRoutes = [
  "/",
  "/services",
  "/technicians",
  "/payment/success",
  "/payment/cancel",
];

/** Auth pages — redirect logged-in users to their dashboard. */
const authRoutes = ["/login", "/register"];

/**
 * Which path prefixes are accessible by each role.
 * All authenticated users can access /profile and general /dashboard.
 */
const roleAllowedPrefixes: Record<string, string[]> = {
  ADMIN: ["/admin", "/profile"],
  TECHNICIAN: ["/technician", "/profile"],
  CUSTOMER: ["/dashboard", "/bookings", "/payments", "/reviews", "/profile"],
};

/** Role → default dashboard redirect. */
const dashboardByRole: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  TECHNICIAN: "/technician/dashboard",
  CUSTOMER: "/dashboard",
};

// ─── Middleware ───────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Always allow Next.js internals & API routes ──
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname === "/manifest.webmanifest"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("fixitnow_token")?.value;
  const payload = token ? decodeToken(token) : null;
  const isAuthenticated = !!payload;

  // ── 2. Public routes — allow everyone ──
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.next();
  }

  // ── 3. Auth routes (login/register) — redirect if already logged in ──
  if (authRoutes.some((route) => pathname.startsWith("/auth/" + route) || pathname === "/" + route)) {
    if (isAuthenticated && payload) {
      const destination = dashboardByRole[payload.role] || "/dashboard";
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  // ── 4. Not authenticated → redirect to login ──
  if (!isAuthenticated || !payload) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 5. Role-based access control ──
  // Check if this path is accessible by the user's role
  const allowedPrefixes = roleAllowedPrefixes[payload.role] || [];

  // Allow general dashboard access for all authenticated users
  if (pathname.startsWith("/dashboard") && payload.role === "CUSTOMER") {
    return NextResponse.next();
  }
  // Allow bookings/payments/reviews only for CUSTOMER
  if (
    (pathname.startsWith("/bookings") ||
      pathname.startsWith("/payments") ||
      pathname.startsWith("/reviews")) &&
    payload.role !== "CUSTOMER"
  ) {
    return NextResponse.redirect(
      new URL(dashboardByRole[payload.role] || "/dashboard", request.url)
    );
  }

  const hasAccess = allowedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));

  if (!hasAccess) {
    // If user somehow reaches a route they shouldn't, redirect to their dashboard
    const destination = dashboardByRole[payload.role] || "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

// ─── Matcher ──────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes — not needed for frontend middleware)
     */
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};