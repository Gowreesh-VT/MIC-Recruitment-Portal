import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/turnstile/verify
 *
 * Verifies a Cloudflare Turnstile token server-side by calling
 * Cloudflare's siteverify API. This must be called from the client
 * before any sensitive action (login, form submission, etc.).
 *
 * Body: { token: string }
 * Returns: { success: boolean }
 */

const CLOUDFLARE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function POST(req: NextRequest) {
  let token: string | undefined;
  try {
    const body = await req.json();
    token = body?.token;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (!token || typeof token !== "string") {
    return NextResponse.json(
      { success: false, error: "Turnstile token is required." },
      { status: 400 }
    );
  }

  if (token === "bypassed" || token === "disabled" || token === "skipped") {
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({ success: true, skipped: true });
    }
    return NextResponse.json(
      { success: false, error: "Bypass tokens are not allowed." },
      { status: 403 }
    );
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;

  // In production, missing secret key must fail closed with server configuration error
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[Turnstile] CRITICAL: TURNSTILE_SECRET_KEY is missing in production environment.");
      return NextResponse.json(
        { success: false, error: "Server verification configuration error." },
        { status: 500 }
      );
    }
    console.warn("[Turnstile] TURNSTILE_SECRET_KEY not set — skipping verification in development.");
    return NextResponse.json({ success: true, skipped: true });
  }

  // Get the visitor IP to pass to Cloudflare for additional signal
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    undefined;

  try {
    const formData = new FormData();
    formData.append("secret", secret);
    formData.append("response", token);
    if (ip) formData.append("remoteip", ip);

    const cfRes = await fetch(CLOUDFLARE_VERIFY_URL, {
      method: "POST",
      body: formData,
    });

    if (!cfRes.ok) {
      console.error("[Turnstile] Cloudflare API returned", cfRes.status);
      return NextResponse.json(
        { success: false, error: "Verification service unavailable." },
        { status: 502 }
      );
    }

    const outcome = (await cfRes.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!outcome.success) {
      console.warn("[Turnstile] Verification failed:", outcome["error-codes"]);
      return NextResponse.json(
        { success: false, error: "Turnstile challenge failed. Please try again." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Turnstile] Verification error:", err);
    return NextResponse.json(
      { success: false, error: "An error occurred during verification." },
      { status: 500 }
    );
  }
}
