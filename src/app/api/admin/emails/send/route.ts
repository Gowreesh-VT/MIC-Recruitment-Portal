import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import EmailLog from "@/models/EmailLog";
import nodemailer from "nodemailer";
import { emailBlastSchema } from "@/lib/validation";
import { escapeHtml } from "@/lib/mailer";

const DEPT_NAMES: Record<string, string> = {
  development: "Development",
  "competitive-coding": "Competitive Coding",
  "ui-ux": "UI/UX",
  "ai-ml": "AI/ML",
  "cyber-security": "Cyber Security",
  design: "Design",
  management: "Management",
  entrepreneurship: "Entrepreneurship",
  "content-media": "Content & Media",
};

function buildQuery(filters: any) {
  const query: any = {};

  if (filters.status) {
    query.overallStatus = filters.status;
  }

  const hasDept = !!filters.department;
  const hasStage = !!filters.stage;

  if (filters.preference === "first") {
    if (hasDept) query.firstPreference = filters.department;
    if (hasStage) query["firstPrefProgress.currentStage"] = filters.stage;
  } else if (filters.preference === "second") {
    if (hasDept) query.secondPreference = filters.department;
    if (hasStage) query["secondPrefProgress.currentStage"] = filters.stage;
  } else {
    // "active" or not specified
    if (hasDept || hasStage) {
      const activeFirstCond: any = { activePreference: "first" };
      const activeSecondCond: any = { activePreference: "second" };

      if (hasDept) {
        activeFirstCond.firstPreference = filters.department;
        activeSecondCond.secondPreference = filters.department;
      }
      if (hasStage) {
        activeFirstCond["firstPrefProgress.currentStage"] = filters.stage;
        activeSecondCond["secondPrefProgress.currentStage"] = filters.stage;
      }

      query.$or = [activeFirstCond, activeSecondCond];
    }
  }

  return query;
}

function interpolate(text: string, data: { email: string; preference: string; stage: string }) {
  return text
    .replace(/\{\{email\}\}/g, data.email)
    .replace(/\{\{preference\}\}/g, data.preference)
    .replace(/\{\{stage\}\}/g, data.stage);
}

function getHTMLWrapper(bodyContent: string) {
  // SECURITY: HTML-escape admin input to prevent injection into email HTML.
  // Line-breaks are preserved by converting \n to <br> after escaping.
  const safeBody = escapeHtml(bodyContent).replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>MIC Recruitment</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Courier New',Courier,monospace;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
         style="background-color:#0a0a0a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0"
               style="max-width:600px;width:100%;border-radius:2px;overflow:hidden;">

          <!-- Top accent bar -->
          <tr>
            <td style="background-color:#14b8a6;height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="background-color:#0d0d0d;border-left:1px solid #1f2937;border-right:1px solid #1f2937;padding:24px 32px 20px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <div style="font-size:18px;font-weight:bold;letter-spacing:6px;color:#14b8a6;text-transform:uppercase;line-height:1;">
                      &#9889; MIC
                    </div>
                    <div style="font-size:9px;letter-spacing:4px;color:#4b5563;text-transform:uppercase;margin-top:5px;line-height:1;">
                      MICROSOFT INNOVATIONS CLUB &bull; VIT VELLORE
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display:inline-block;background-color:#111827;border:1px solid #374151;border-radius:2px;color:#9ca3af;font-size:9px;letter-spacing:2px;padding:4px 10px;text-transform:uppercase;">
                      RECRUITMENT&nbsp;2026&#8209;27
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#0d0d0d;border-left:1px solid #1f2937;border-right:1px solid #1f2937;padding:32px;">
              <div style="font-size:14px;color:#d1d5db;line-height:1.9;">
                ${safeBody}
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="background-color:#0d0d0d;border-left:1px solid #1f2937;border-right:1px solid #1f2937;padding:0 32px;">
              <div style="border-top:1px solid #1f2937;font-size:0;">&nbsp;</div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#080808;border-left:1px solid #1f2937;border-right:1px solid #1f2937;padding:20px 32px;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:11px;color:#374151;letter-spacing:1px;text-transform:uppercase;">
                Microsoft Innovations Club &mdash; Core Team
              </p>
              <p style="margin:0;font-size:10px;color:#1f2937;letter-spacing:1px;">
                This is an automated email. Please do not reply directly.
              </p>
            </td>
          </tr>

          <!-- Bottom accent bar -->
          <tr>
            <td style="background-color:#14b8a6;height:2px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  // Auth guard
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 403 }
    );
  }

  const smtpEmail = process.env.SMTP_EMAIL;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (!smtpEmail || !smtpPassword) {
    return NextResponse.json(
      { success: false, error: "SMTP settings not configured on server." },
      { status: 500 }
    );
  }

  await dbConnect();

  try {
    const body = await req.json();
    const parseResult = emailBlastSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Validation failed." },
        { status: 400 }
      );
    }
    const { recipientType, testEmail, filters, subject, body: emailBody, templateType } = parseResult.data;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    });

    const adminEmail = session.user.email ?? "admin@mic.org";

    // ─────────────────────────────────────────────────────────────────────────
    // Test Email Delivery Flow
    // ─────────────────────────────────────────────────────────────────────────
    if (recipientType === "test") {
      const targetTestEmail = testEmail || adminEmail;

      // Try finding a sample application to show resolved dynamic tags
      const sampleApp = await Application.findOne();
      const sampleDeptSlug = sampleApp
        ? (sampleApp.activePreference === "first" ? sampleApp.firstPreference : sampleApp.secondPreference)
        : "development";
      const sampleStage = sampleApp
        ? (sampleApp.activePreference === "first" ? sampleApp.firstPrefProgress.currentStage : sampleApp.secondPrefProgress.currentStage)
        : 1;

      const dynamicData = {
        email: targetTestEmail,
        preference: DEPT_NAMES[sampleDeptSlug || ""] || "Development",
        stage: String(sampleStage),
      };

      const resolvedSubject = interpolate(subject, dynamicData);
      const resolvedBody = interpolate(emailBody, dynamicData);
      const htmlBody = getHTMLWrapper(resolvedBody);

      try {
        await transporter.sendMail({
          from: `"MIC Recruitment" <${smtpEmail}>`,
          to: targetTestEmail,
          subject: resolvedSubject,
          html: htmlBody,
        });

        // Log the test send in the Email logs
        await EmailLog.create({
          recipientEmail: targetTestEmail,
          senderEmail: adminEmail,
          subject: resolvedSubject,
          body: resolvedBody,
          templateUsed: `${templateType} (test)`,
          status: "success",
        });

        return NextResponse.json({
          success: true,
          message: `Test email sent successfully to ${targetTestEmail}.`,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Send failed.";
        await EmailLog.create({
          recipientEmail: targetTestEmail,
          senderEmail: adminEmail,
          subject: resolvedSubject,
          body: resolvedBody,
          templateUsed: `${templateType} (test)`,
          status: "failed",
          errorDetails: errorMsg,
        });

        return NextResponse.json(
          { success: false, error: `Failed sending test email: ${errorMsg}` },
          { status: 500 }
        );
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Cohort Batch Delivery Flow
    // ─────────────────────────────────────────────────────────────────────────
    const query = buildQuery(filters || {});
    const applicants = await Application.find(query);

    if (applicants.length === 0) {
      return NextResponse.json(
        { success: false, error: "No applicants found matching the selected filters." },
        { status: 404 }
      );
    }

    let successCount = 0;
    let failCount = 0;
    const failures: { email: string; error: string }[] = [];

    // Send emails sequentially (simple non-blocking loop with log writes)
    for (const applicant of applicants) {
      const deptSlug = applicant.activePreference === "first" ? applicant.firstPreference : applicant.secondPreference;
      const stage = applicant.activePreference === "first" ? applicant.firstPrefProgress.currentStage : applicant.secondPrefProgress.currentStage;

      const dynamicData = {
        email: applicant.userEmail,
        preference: DEPT_NAMES[deptSlug || ""] || "Development",
        stage: String(stage),
      };

      const resolvedSubject = interpolate(subject, dynamicData);
      const resolvedBody = interpolate(emailBody, dynamicData);
      const htmlBody = getHTMLWrapper(resolvedBody);

      try {
        await transporter.sendMail({
          from: `"MIC Recruitment" <${smtpEmail}>`,
          to: applicant.userEmail,
          subject: resolvedSubject,
          html: htmlBody,
        });

        await EmailLog.create({
          recipientEmail: applicant.userEmail,
          senderEmail: adminEmail,
          subject: resolvedSubject,
          body: resolvedBody,
          templateUsed: templateType,
          status: "success",
        });

        successCount++;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Send failed.";
        await EmailLog.create({
          recipientEmail: applicant.userEmail,
          senderEmail: adminEmail,
          subject: resolvedSubject,
          body: resolvedBody,
          templateUsed: templateType,
          status: "failed",
          errorDetails: errorMsg,
        });

        failures.push({ email: applicant.userEmail, error: errorMsg });
        failCount++;
      }
    }

    // Log the bulk admin action in the Audit Logs
    const { logAdminAction } = await import("@/lib/logger");
    await logAdminAction(
      adminEmail,
      "bulk_email_blast",
      `${applicants.length} targets`,
      `Sent ${successCount} successfully, ${failCount} failed. Filters: ${JSON.stringify(filters)}`
    );

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failCount,
      failures,
      message: `Completed blast. Sent: ${successCount}. Failed: ${failCount}.`,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Internal error occurred.";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
