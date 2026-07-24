import nodemailer from 'nodemailer';

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

const smtpEmail = process.env.SMTP_EMAIL;
const smtpPassword = process.env.SMTP_PASSWORD;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: smtpEmail,
    pass: smtpPassword,
  },
});

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
                      &#9889; MIC
                    </div>
                    <div style="font-size:9px;letter-spacing:4px;color:#4b5563;text-transform:uppercase;margin-top:5px;line-height:1;">
                      MICROSOFT INNOVATIONS CLUB &bull; VIT VELLORE
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

/** Admin notes callout box */
function notesBlock(notes: string): string {
  return `
  <div style="margin:20px 0;padding:16px 18px;background-color:#111827;border-left:3px solid #f59e0b;border-radius:0 2px 2px 0;">
    <div style="font-size:9px;letter-spacing:2px;color:#f59e0b;text-transform:uppercase;margin-bottom:8px;font-weight:bold;">
      &#9998; Admin Notes
    </div>
    <div style="font-size:13px;color:#d1d5db;line-height:1.7;">
      ${escapeHtml(notes).replace(/\n/g, '<br>')}
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Email: Application Receipt
// ─────────────────────────────────────────────────────────────────────────────

export async function sendApplicationReceipt(userEmail: string, deptName: string) {
  if (!smtpEmail || !smtpPassword) {
    console.warn(`[MAILER] Skipping receipt for ${userEmail}. SMTP credentials are not set.`);
    return;
  }

  const ACCENT = '#f97316'; // orange — matches the "quest accepted" energy

  const body = [
    para('Hello Challenger,'),
    para(`Your application for the <strong style="color:#f97316;">${escapeHtml(deptName)}</strong> department has been successfully submitted. You have taken the first step on your quest to join MIC!`),
    infoCard(
      infoRow('Department', deptName, ACCENT) +
      infoRow('Status', 'Under Review', ACCENT) +
      infoRow('Stage', 'Stage 1 — Submitted', ACCENT),
      ACCENT
    ),
    para("Our core team will review your submission. Keep an eye on the recruitment portal for status updates. We'll notify you when there's news."),
    ctaButton('CHECK PORTAL STATUS', 'https://mic.vitstudent.ac.in/recruitments', ACCENT),
    para('Good luck &mdash; may your stats be impressive!', '#6b7280'),
  ].join('');

  try {
    await transporter.sendMail({
      from: `"MIC Recruitment" <${smtpEmail}>`,
      to: userEmail,
      subject: `&#9889; Quest Accepted: ${deptName} Application Received!`,
      html: buildEmailHtml({
        heroColor: ACCENT,
        heroIcon: '&#10003;',
        heroLabel: 'Quest Accepted',
        heroTitle: 'Application Received',
        heroSubtitle: `${deptName} Department`,
        body,
      }),
    });
  } catch (error) {
    console.error('[MAILER] Failed to send receipt:', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Email: Stage Update (Passed / Advanced)
// ─────────────────────────────────────────────────────────────────────────────

export async function sendStageUpdate(userEmail: string, status: string, notes?: string) {
  if (!smtpEmail || !smtpPassword) {
    console.warn(`[MAILER] Skipping status update for ${userEmail}. SMTP credentials are not set.`);
    return;
  }

  const isAccepted = status === 'passed';
  if (!isAccepted) {
    console.log(`[MAILER] Rejection/failed email blocked for ${userEmail} as per settings.`);
    return;
  }

  const ACCENT = '#10b981'; // emerald green

  const body = [
    para('Congratulations, Challenger!'),
    para("You have successfully cleared this stage of the MIC recruitment process. Your skills have been acknowledged by the core team &mdash; this is a major achievement!"),
    infoCard(
      infoRow('Result', '&#10003; Stage Passed', ACCENT) +
      infoRow('Next Step', 'Check portal for Stage details', ACCENT),
      ACCENT
    ),
    notes ? notesBlock(notes) : '',
    para('Log in to the portal to view the requirements for the next stage. Stay sharp and keep pushing!'),
    ctaButton('VIEW NEXT STAGE', 'https://mic.vitstudent.ac.in/recruitments', ACCENT),
    para('See you at the next level &mdash; MIC Core Team', '#6b7280'),
  ].join('');

  try {
    await transporter.sendMail({
      from: `"MIC Recruitment" <${smtpEmail}>`,
      to: userEmail,
      subject: '&#9651; LEVEL UP! You cleared a recruitment stage',
      html: buildEmailHtml({
        heroColor: ACCENT,
        heroIcon: '&#9651;',
        heroLabel: 'Stage Cleared',
        heroTitle: 'LEVEL UP!',
        heroSubtitle: 'Quest Advanced',
        body,
      }),
    });
  } catch (error) {
    console.error('[MAILER] Failed to send stage update:', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Email: Interview Booking Confirmation
// ─────────────────────────────────────────────────────────────────────────────

export async function sendInterviewBookingConfirmation(
  userEmail: string,
  timeString: string,
  locationDetails: string,
  isOnline: boolean
) {
  if (!smtpEmail || !smtpPassword) {
    console.warn(`[MAILER] Skipping booking confirmation for ${userEmail}. SMTP credentials are not set.`);
    return;
  }

  const ACCENT = '#14b8a6'; // teal

  // For online interviews, locationDetails contains the meeting link
  const meetingLinkRow = isOnline
    ? `
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #1f2937;color:#6b7280;font-size:11px;letter-spacing:1px;text-transform:uppercase;width:36%;vertical-align:top;">
          Meet Link
        </td>
        <td style="padding:10px 14px;border-bottom:1px solid #1f2937;font-size:13px;vertical-align:top;">
          <a href="${escapeHtml(locationDetails)}" target="_blank"
             style="color:${ACCENT};font-weight:bold;word-break:break-all;">
            Join Google Meet &#8594;
          </a>
        </td>
      </tr>`
    : '';

  const body = [
    para('Your interview slot has been locked in!'),
    para("Please review the details below carefully. Make sure you&apos;re available and prepared at the scheduled time. First impressions matter &mdash; be on time!"),
    infoCard(
      infoRow('Date &amp; Time', timeString, ACCENT) +
      infoRow('Format', isOnline ? 'Online (Google Meet)' : 'In-Person', ACCENT) +
      infoRow(isOnline ? 'Location / Link' : 'Venue', locationDetails, ACCENT) +
      meetingLinkRow,
      ACCENT
    ),
    `<div style="margin:20px 0;padding:16px 18px;background-color:#111827;border:1px solid #1f2937;border-left:3px solid #14b8a6;border-radius:0 2px 2px 0;">
      <div style="font-size:9px;letter-spacing:2px;color:#14b8a6;text-transform:uppercase;margin-bottom:10px;font-weight:bold;">&#9432; Pre-Interview Checklist</div>
      <div style="font-size:13px;color:#d1d5db;line-height:2;">
        &bull;&nbsp; Test your audio &amp; video (if online) before the interview<br/>
        &bull;&nbsp; Keep a copy of your submitted work handy<br/>
        &bull;&nbsp; Be ready 5 minutes before the scheduled time<br/>
        &bull;&nbsp; Stay calm &mdash; we&apos;re rooting for you!
      </div>
    </div>`,
    ctaButton('VIEW PORTAL', 'https://mic.vitstudent.ac.in/recruitments', ACCENT),
    para('Best of luck &mdash; MIC Core Team', '#6b7280'),
  ].join('');

  try {
    await transporter.sendMail({
      from: `"MIC Recruitment" <${smtpEmail}>`,
      to: userEmail,
      subject: '&#128197; Interview Confirmed — MIC Recruitment',
      html: buildEmailHtml({
        heroColor: ACCENT,
        heroIcon: '&#128197;',
        heroLabel: 'Interview Scheduled',
        heroTitle: 'SLOT CONFIRMED',
        heroSubtitle: 'Final Round Incoming',
        body,
      }),
    });
  } catch (error) {
    console.error('[MAILER] Failed to send booking confirmation:', error);
  }
}
