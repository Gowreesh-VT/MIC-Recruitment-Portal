import nodemailer from 'nodemailer';
import { dbConnect } from "@/lib/mongodb";
import RecruitmentCycle from "@/models/RecruitmentCycle";
import EmailLog from "@/models/EmailLog";
import { ACTIVE_CYCLE_ID } from "@/lib/constants";
import { escapeHtml } from "@/lib/escapeHtml";

export { escapeHtml };

function buildEmailHtml({
  heroColor,
  heroIcon,
  heroLabel,
  heroTitle,
  heroSubtitle,
  body,
}: {
  heroColor: string;
  heroIcon: string;
  heroLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  body: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>MIC Recruitment</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Courier New',Courier,monospace;">

  <!-- Outer wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
         style="background-color:#0a0a0a;padding:32px 16px;">
    <tr>
      <td align="center">

        <!-- Card shell (max 600px) -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0"
               style="max-width:600px;width:100%;border-radius:2px;overflow:hidden;">

          <!-- ── Top accent bar ── -->
          <tr>
            <td style="background-color:${heroColor};height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- ── Header ── -->
          <tr>
            <td style="background-color:#0d0d0d;border-left:1px solid #1f2937;border-right:1px solid #1f2937;padding:28px 32px 20px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <!-- Wordmark -->
                    <div style="font-size:18px;font-weight:bold;letter-spacing:6px;color:${heroColor};text-transform:uppercase;line-height:1;">
                      MIC
                    </div>
                    <div style="font-size:9px;letter-spacing:4px;color:#4b5563;text-transform:uppercase;margin-top:5px;line-height:1;">
                      MICROSOFT INNOVATIONS CLUB &bull; VIT CHENNAI
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <!-- Season tag -->
                    <span style="display:inline-block;background-color:#111827;border:1px solid #374151;border-radius:2px;color:#9ca3af;font-size:9px;letter-spacing:2px;padding:4px 10px;text-transform:uppercase;">
                      RECRUITMENT&nbsp;2026&#8209;27
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Hero banner ── -->
          <tr>
            <td style="background-color:#111827;border-left:1px solid #1f2937;border-right:1px solid #1f2937;padding:36px 32px;text-align:center;">
              <!-- Icon circle -->
              <div style="display:inline-block;width:68px;height:68px;border-radius:50%;background-color:#0d0d0d;border:2px solid ${heroColor};line-height:68px;text-align:center;font-size:30px;margin-bottom:20px;">
                ${heroIcon}
              </div>
              <br/>
              <!-- Badge label -->
              <span style="display:inline-block;background-color:${heroColor};color:#000;font-size:9px;font-weight:bold;letter-spacing:3px;padding:4px 14px;text-transform:uppercase;border-radius:2px;margin-bottom:14px;">
                ${escapeHtml(heroLabel)}
              </span>
              <br/>
              <!-- Main title -->
              <div style="font-size:26px;font-weight:bold;color:#f9fafb;letter-spacing:4px;text-transform:uppercase;margin-top:10px;line-height:1.2;">
                ${escapeHtml(heroTitle)}
              </div>
              <!-- Subtitle -->
              <div style="font-size:13px;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;margin-top:8px;">
                ${escapeHtml(heroSubtitle)}
              </div>
            </td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td style="background-color:#0d0d0d;border-left:1px solid #1f2937;border-right:1px solid #1f2937;padding:32px 32px;">
              ${body}
            </td>
          </tr>

          <!-- ── Divider ── -->
          <tr>
            <td style="background-color:#0d0d0d;border-left:1px solid #1f2937;border-right:1px solid #1f2937;padding:0 32px;">
              <div style="border-top:1px solid #1f2937;font-size:0;">&nbsp;</div>
            </td>
          </tr>

          <!-- ── Footer ── -->
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

          <!-- ── Bottom accent bar ── -->
          <tr>
            <td style="background-color:${heroColor};height:2px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

        </table>
        <!-- /Card shell -->

      </td>
    </tr>
  </table>
  <!-- /Outer wrapper -->

</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Transporter & Email Dispatcher
// ─────────────────────────────────────────────────────────────────────────────

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return null;
}

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  templateKey?: string;
  senderEmail?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  templateKey = 'generic',
  senderEmail = process.env.SMTP_FROM || 'noreply@micvitc.com',
}: SendMailOptions): Promise<{ success: boolean; error?: string }> {
  await dbConnect();

  // Check if automated email delivery is enabled in global cycle settings
  const cycle = await RecruitmentCycle.findOne({ cycleId: ACTIVE_CYCLE_ID });
  if (cycle && cycle.emailNotificationsEnabled === false) {
    console.log(`[MAILER SKIPPED] Automated email delivery is disabled in cycle settings.`);
    return { success: false, error: 'Email delivery disabled in admin cycle settings.' };
  }

  const transporter = getTransporter();

  try {
    if (transporter) {
      await transporter.sendMail({
        from: senderEmail,
        to,
        subject,
        html,
      });
    } else {
      console.log(`[MAILER SIMULATED MODE] To: ${to} | Subject: ${subject}`);
    }

    await EmailLog.create({
      recipientEmail: to,
      senderEmail,
      subject,
      body: html,
      templateUsed: templateKey,
      status: 'success',
    });

    return { success: true };
  } catch (err: unknown) {
    const errorDetails = err instanceof Error ? err.message : String(err);
    console.error(`[MAILER ERROR] Failed sending to ${to}:`, errorDetails);

    try {
      await EmailLog.create({
        recipientEmail: to,
        senderEmail,
        subject,
        body: html,
        templateUsed: templateKey,
        status: 'failed',
        errorDetails,
      });
    } catch (logErr) {
      console.error('[MAILER ERROR] Failed to record EmailLog:', logErr);
    }

    return { success: false, error: errorDetails };
  }
}
