import nodemailer from 'nodemailer';
import { dbConnect } from "@/lib/mongodb";
import RecruitmentCycle from "@/models/RecruitmentCycle";
import EmailLog from "@/models/EmailLog";
import { ACTIVE_CYCLE_ID } from "@/lib/constants";

// ─────────────────────────────────────────────────────────────────────────────
// Shared Layout
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wraps any email content in the shared MIC header + footer shell.
 *
 * @param heroColor     Accent color for the hero banner  (e.g. '#14b8a6')
 * @param heroIcon      Large emoji/symbol shown in the hero (e.g. '✦')
 * @param heroLabel     Small badge text above the title   (e.g. 'STAGE CLEARED')
 * @param heroTitle     Main bold hero title               (e.g. 'LEVEL UP!')
 * @param heroSubtitle  Smaller subtitle under title       (e.g. 'Quest Advanced')
 * @param body          Inner HTML content block
 */
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
// Reusable body components
// ─────────────────────────────────────────────────────────────────────────────

/** Standard paragraph text */
function para(text: string, color = '#d1d5db'): string {
  return `<p style="margin:0 0 16px 0;font-size:14px;line-height:1.8;color:${color};">${text}</p>`;
}

/** A highlighted info-card row (label + value) */
function infoRow(label: string, value: string, accentColor: string): string {
  return `
  <tr>
    <td style="padding:10px 14px;border-bottom:1px solid #1f2937;color:#6b7280;font-size:11px;letter-spacing:1px;text-transform:uppercase;width:36%;vertical-align:middle;">
      ${escapeHtml(label)}
    </td>
    <td style="padding:10px 14px;border-bottom:1px solid #1f2937;color:${accentColor};font-size:13px;font-weight:bold;vertical-align:middle;">
      ${escapeHtml(value)}
    </td>
  </tr>`;
}

/** A bordered info card containing info rows */
function infoCard(rows: string, accentColor: string): string {
  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
         style="margin:20px 0;border:1px solid ${accentColor};border-radius:2px;border-collapse:collapse;overflow:hidden;">
    ${rows}
  </table>`;
}

/** CTA button */
function ctaButton(text: string, href: string, accentColor: string): string {
  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
    <tr>
      <td style="border-radius:2px;background-color:${accentColor};">
        <a href="${href}" target="_blank"
           style="display:inline-block;padding:12px 28px;font-family:'Courier New',Courier,monospace;font-size:12px;font-weight:bold;letter-spacing:3px;color:#000;text-decoration:none;text-transform:uppercase;">
          ${escapeHtml(text)}
        </a>
      </td>
    </tr>
  </table>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Email: Final Preferences Confirmation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Escape HTML special characters to prevent XSS when embedding
 * user-supplied or admin-supplied strings in HTML email bodies.
 */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export async function sendFinalPreferencesConfirmation(
  userEmail: string,
  techPrefName: string,
  nonTechPrefName: string
) {
  const smtpEmail = process.env.SMTP_EMAIL;
  const smtpPassword = process.env.SMTP_PASSWORD;

  // Guard: only create a transporter when credentials are confirmed present.
  // Previously the transporter was created at module load with potentially
  // undefined credentials, causing a silent misconfiguration at startup.
  if (!smtpEmail || !smtpPassword) {
    console.warn(`[MAILER] Skipping final preferences email for ${userEmail}. SMTP credentials not set.`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: smtpEmail, pass: smtpPassword },
  });

  try {
    await dbConnect();
    const cycle = await RecruitmentCycle.findOne({ cycleId: ACTIVE_CYCLE_ID }).lean();
    if (cycle && cycle.emailNotificationsEnabled === false) {
      console.log(`[MAILER] Email delivery is disabled in Admin Settings. Skipping final preferences email for ${userEmail}.`);
      return;
    }
  } catch (dbErr) {
    console.error('[MAILER] Error checking recruitment cycle email settings:', dbErr);
  }

  const ACCENT = '#1093EB'; // Blue retro accent

  const body = [
    para('Hello Challenger,'),
    para('Your final recruitment preferences have been successfully confirmed and locked for evaluation. Here is a summary of your chosen quest pathways:'),
    infoCard(
      infoRow('Tech Preference', techPrefName, ACCENT) +
      infoRow('Non-Tech Preference', nonTechPrefName, ACCENT) +
      infoRow('Application Status', 'Finalized & Locked', ACCENT),
      ACCENT
    ),
    para('Editing for your application is now closed. Our domain evaluation boards are reviewing your responses and code. Stay tuned for results!'),
    ctaButton('VIEW APPLICATION STATUS', 'https://recruitments.microsoftinnovations.club/recruitments', ACCENT),
    para('Best of luck on your recruitment journey &mdash; MIC Core Team', '#6b7280'),
  ].join('');

  const subject = '⚡ Quest Locked: Final Recruitment Preferences Confirmed!';
  const htmlBody = buildEmailHtml({
    heroColor: ACCENT,
    heroIcon: '⚡',
    heroLabel: 'Preferences Finalized',
    heroTitle: 'Quest Locked',
    heroSubtitle: 'Final Preferences Confirmed',
    body,
  });

  try {
    await transporter.sendMail({
      from: `"MIC Recruitment" <${smtpEmail}>`,
      to: userEmail,
      subject,
      html: htmlBody,
    });
    // Log successful delivery to EmailLog for admin visibility in production
    await EmailLog.create({
      recipientEmail: userEmail,
      senderEmail: smtpEmail,
      subject,
      body: htmlBody,
      templateUsed: 'final-preferences-confirmation',
      status: 'success',
    });
  } catch (error) {
    console.error('[MAILER] Failed to send final preferences confirmation email:', error);
    // Log failed delivery so admins can diagnose issues in production
    try {
      await EmailLog.create({
        recipientEmail: userEmail,
        senderEmail: smtpEmail,
        subject,
        body: htmlBody,
        templateUsed: 'final-preferences-confirmation',
        status: 'failed',
        errorDetails: error instanceof Error ? error.message : String(error),
      });
    } catch (logErr) {
      console.error('[MAILER] Failed to write EmailLog entry:', logErr);
    }
  }
}
