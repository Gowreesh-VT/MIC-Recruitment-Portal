import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import type { NextAuthRequest } from "next-auth";

const { auth } = NextAuth(authConfig);

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ---------------------------------------------------------------------------
// Rate Limiter
// ---------------------------------------------------------------------------
const RATE_LIMIT_MAX = 100;

// Initialize Upstash Redis if env vars are present
let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX, "1 m"),
    analytics: true,
  });
}

// Fallback in-memory map if Upstash is not configured
const fallbackRateLimitMap = new Map<string, { count: number; resetAt: number }>();

async function isRateLimited(ip: string): Promise<boolean> {
  if (ratelimit) {
    try {
      const { success } = await ratelimit.limit(`ratelimit_${ip}`);
      return !success;
    } catch (err) {
      console.warn("Upstash rate limit failed, falling back to memory.", err);
    }
  }

  // Fallback memory implementation
  const now = Date.now();
  const entry = fallbackRateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    fallbackRateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

// ---------------------------------------------------------------------------
// Route matchers
// ---------------------------------------------------------------------------
function isApplyRoute(pathname: string) {
  return pathname.startsWith("/apply");
}

function isAdminRoute(pathname: string) {
  return pathname.startsWith("/admin");
}

function isApiApplyRoute(pathname: string) {
  return pathname.startsWith("/api/apply");
}

function isApiAdminRoute(pathname: string) {
  return pathname.startsWith("/api/admin");
}

// ---------------------------------------------------------------------------
// Main middleware — uses auth() as the wrapper (NextAuth v5 pattern)
// ---------------------------------------------------------------------------
export default auth(async (req: NextAuthRequest) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const userEmail = session?.user?.email ?? "";
  const userRole = (session?.user as { role?: string } | undefined)?.role ?? "";

  // --- Rate limit all /api/apply/* routes ---
  if (isApiApplyRoute(pathname)) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    if (await isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }
  }

  // --- Protect /apply/* pages ---
  if (isApplyRoute(pathname)) {
    if (!session?.user) {
      const url = req.nextUrl.clone();
      url.pathname = "/login"; // Changed from /api/auth/signin to the new /login page
      url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(url);
    }

    if (!userEmail.endsWith("@vitstudent.ac.in")) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/error";
      url.searchParams.set("error", "AccessDenied");
      return NextResponse.redirect(url);
    }
  }

  // --- /login route logic ---
  if (pathname === "/login") {
    if (session?.user) {
      // Already logged in, redirect to recruitments
      const url = req.nextUrl.clone();
      url.pathname = "/recruitments";
      return NextResponse.redirect(url);
    }
  }

  // --- Protect /admin/* pages ---
  if (isAdminRoute(pathname) && pathname !== "/admin/login") {
    if (!session?.user) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    if (userRole !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("error", "AccessDenied");
      return NextResponse.redirect(url);
    }
  }

  // --- Protect /api/admin/* routes ---
  if (isApiAdminRoute(pathname)) {
    if (!session?.user || userRole !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/apply/:path*",
    "/login",
    "/admin/:path*",
    "/api/apply/:path*",
    "/api/admin/:path*",
  ],
};
