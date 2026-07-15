import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Registration from "@/models/Registration";

// Validate Cloudflare Turnstile token
async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY is not configured.");
    return false;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (ip) {
      formData.append("remoteip", ip);
    }

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return !!data.success;
  } catch (error) {
    console.error("Error verifying Turnstile token:", error);
    return false;
  }
}

// Validate hCaptcha token
async function verifyHCaptcha(token: string, ip?: string): Promise<boolean> {
  const secretKey = process.env.HCAPTCHA_SECRET_KEY;
  if (!secretKey) {
    console.error("HCAPTCHA_SECRET_KEY is not configured.");
    return false;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (ip) {
      formData.append("remoteip", ip);
    }

    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return !!data.success;
  } catch (error) {
    console.error("Error verifying hCaptcha token:", error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, role, githubUrl, linkedinUrl, portfolioUrl, captchaToken, captchaType } = body;

    // 1. Basic validation
    if (!name || !email || !phone || !role) {
      return NextResponse.json(
        { success: false, error: "Required fields are missing." },
        { status: 400 }
      );
    }

    // 2. Bot protection verification
    if (!captchaToken) {
      return NextResponse.json(
        { success: false, error: "Security verification token is missing." },
        { status: 400 }
      );
    }

    // Extract client IP address for CAPTCHA verification
    const ip = request.headers.get("x-forwarded-for") || undefined;

    let isHuman = false;
    if (captchaType === "hcaptcha") {
      isHuman = await verifyHCaptcha(captchaToken, ip);
    } else {
      // Default to turnstile
      isHuman = await verifyTurnstile(captchaToken, ip);
    }

    if (!isHuman) {
      return NextResponse.json(
        { success: false, error: "Security check failed. Please try again." },
        { status: 400 }
      );
    }

    // 3. Connect to Database
    await dbConnect();

    // 4. Check for duplicate registration
    const existing = await Registration.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A registration with this email already exists." },
        { status: 409 }
      );
    }

    // 5. Save to MongoDB
    const registration = new Registration({
      name,
      email,
      phone,
      role,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
    });

    await registration.save();

    return NextResponse.json(
      { success: true, message: "Registration successful!" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration endpoint error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
