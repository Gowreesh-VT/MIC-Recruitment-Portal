import { NextRequest, NextResponse } from "next/server";

const PORTAL_ORIGIN = process.env.NEXTAUTH_URL ?? process.env.APP_URL;

/**
 * validateOrigin — CSRF mitigation for state-changing API routes.
 *
 * NextAuth v5's `auth()` validates the session but does NOT add automatic
 * CSRF protection to custom API routes. A logged-in victim could be tricked
 * into triggering candidate endpoints (apply/init, second-pref, switch-pref,
 * confirm-final) from a malicious cross-origin page.
 *
 * This helper enforces that the `Origin` header matches the expected portal
 * origin. It is intentionally skipped in development (where the origin may
 * vary across localhost ports and there is no real CSRF threat model).
 *
 * Usage:
 *   const csrfError = validateOrigin(req);
 *   if (csrfError) return csrfError;
 *
 * Environment requirements:
 *   Set NEXTAUTH_URL (e.g. https://recruitments.microsoftinnovations.club)
 *   in your production environment variables. If absent, the check is skipped
 *   with a warning rather than blocking all requests.
 */
export function validateOrigin(req: NextRequest): NextResponse | null {
  // Skip in development — origin varies across localhost ports and there is
  // no meaningful CSRF threat in a local dev environment.
  if (process.env.NODE_ENV !== "production") return null;

  const origin = req.headers.get("origin");

  // If there is no Origin header the request is from a same-origin fetch or
  // a non-browser client (e.g. server-side call). Allow it through — only
  // cross-origin browser requests send Origin.
  if (!origin) return null;

  if (!PORTAL_ORIGIN) {
    // Misconfiguration: we cannot validate without knowing the expected origin.
    // Log a warning but do not block — avoids a hard outage on misconfiguration.
    console.warn(
      "[CSRF] NEXTAUTH_URL / APP_URL not set — Origin validation skipped. " +
      "Set this env var to enable CSRF protection."
    );
    return null;
  }

  let expectedOrigin: string;
  try {
    expectedOrigin = new URL(PORTAL_ORIGIN).origin;
  } catch {
    console.error("[CSRF] NEXTAUTH_URL is not a valid URL:", PORTAL_ORIGIN);
    return null;
  }

  if (origin !== expectedOrigin) {
    console.warn(`[CSRF] Origin mismatch: expected ${expectedOrigin}, got ${origin}`);
    return NextResponse.json(
      { success: false, error: "Forbidden: cross-origin request rejected." },
      { status: 403 }
    );
  }

  return null;
}
