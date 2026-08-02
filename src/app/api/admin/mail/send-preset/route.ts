import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import mongoose from "mongoose";
import { sendEmail } from "@/lib/mailer";
import { getPresetEmailContent, PresetKey, EMAIL_PRESETS } from "@/lib/templates/email";

export async function POST(req: NextRequest) {
  // ── Auth Guard ─────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 403 }
    );
  }

  await dbConnect();

  try {
    const body = await req.json();
    const { presetKey, candidateIds, customNote } = body as {
      presetKey: PresetKey;
      candidateIds: string[];
      customNote?: string;
    };

    if (!presetKey || !EMAIL_PRESETS[presetKey]) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing presetKey." },
        { status: 400 }
      );
    }

    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "No candidate IDs provided." },
        { status: 400 }
      );
    }

    // Validate ObjectIds
    const validIds = candidateIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid candidate ObjectIds provided." },
        { status: 400 }
      );
    }

    // Query candidate records
    const applications = await Application.find({ _id: { $in: validIds } });
    if (applications.length === 0) {
      return NextResponse.json(
        { success: false, error: "No matching candidate applications found." },
        { status: 404 }
      );
    }

    const results = {
      total: applications.length,
      sent: 0,
      failed: 0,
      details: [] as { email: string; status: "success" | "failed"; error?: string }[],
    };

    for (const app of applications) {
      const candidateEmail = app.userEmail;
      const candidateName = app.fullName || candidateEmail;
      const activePref = app.activePreference === "second" ? app.secondPreference : app.firstPreference;
      const departmentName = (activePref as string) || app.firstPreference || "General";

      try {
        const { subject, html } = getPresetEmailContent({
          presetKey,
          candidateName,
          departmentName,
          applicationId: String(app._id),
          customNote,
        });

        const sendRes = await sendEmail({
          to: candidateEmail,
          subject,
          html,
          templateKey: presetKey,
        });

        if (sendRes.success) {
          results.sent++;
          results.details.push({ email: candidateEmail, status: "success" });
        } else {
          results.failed++;
          results.details.push({
            email: candidateEmail,
            status: "failed",
            error: sendRes.error,
          });
        }
      } catch (err: unknown) {
        const errStr = err instanceof Error ? err.message : String(err);
        results.failed++;
        results.details.push({ email: candidateEmail, status: "failed", error: errStr });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Preset email "${EMAIL_PRESETS[presetKey].label}" processed for ${results.total} candidates (${results.sent} sent, ${results.failed} failed).`,
      results,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to dispatch preset emails.";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
