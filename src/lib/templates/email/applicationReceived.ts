import { escapeHtml } from "@/lib/escapeHtml";

export interface ApplicationReceivedEmailProps {
  candidateName: string;
  departmentName: string;
  applicationId: string;
  submittedAt?: string;
}

export function buildApplicationReceivedEmail({
  candidateName,
  departmentName,
  applicationId,
  submittedAt,
}: ApplicationReceivedEmailProps): { subject: string; html: string } {
  const subject = `[MIC Recruitment] Response Saved - ${departmentName}`;
  const dateStr = submittedAt || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Response Saved</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Courier New',Courier,monospace;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#0a0a0a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;border-radius:4px;overflow:hidden;border:1px solid #1f2937;">
          <tr>
            <td style="background-color:#3b82f6;height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="background-color:#0d0d0d;padding:24px 32px;border-bottom:1px solid #1f2937;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:12px;">
                          <img src="https://h8z6stjynz.ufs.sh/f/nEev6VX4XfKENEfmQvcJYjwsBLCbSNUMGi76gpR4tA0OayfV" alt="MIC Logo" width="36" height="36" style="display:block;width:36px;height:36px;border-radius:4px;border:0;" />
                        </td>
                        <td style="vertical-align:middle;">
                          <div style="font-size:16px;font-weight:bold;letter-spacing:3px;color:#ffffff;text-transform:uppercase;">MIC</div>
                          <div style="font-size:9px;letter-spacing:1px;color:#9ca3af;text-transform:uppercase;margin-top:2px;">MICROSOFT INNOVATIONS CLUB &bull; VIT CHENNAI</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right">
                    <span style="background-color:#1e293b;border:1px solid #3b82f6;border-radius:2px;color:#60a5fa;font-size:9px;letter-spacing:1px;padding:4px 8px;text-transform:uppercase;">RECRUITMENT 2026</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#111827;padding:32px;text-align:center;">
              <span style="background-color:#3b82f6;color:#000;font-size:9px;font-weight:bold;letter-spacing:2px;padding:3px 10px;text-transform:uppercase;border-radius:2px;">RESPONSE LOGGED</span>
              <div style="font-size:22px;font-weight:bold;color:#f9fafb;letter-spacing:2px;margin-top:12px;text-transform:uppercase;">Application Received!</div>
              <div style="font-size:12px;color:#9ca3af;margin-top:6px;">Your submission has been securely recorded into our system.</div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#0d0d0d;padding:28px 32px;">
              <p style="color:#d1d5db;font-size:14px;line-height:1.6;margin-top:0;">Hello <strong>${escapeHtml(candidateName)}</strong>,</p>
              <p style="color:#9ca3af;font-size:13px;line-height:1.6;">Thank you for applying to the <strong>${escapeHtml(departmentName)}</strong> department at Microsoft Innovations Club. Your response and preferences have been successfully logged.</p>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:20px 0;border:1px solid #1f2937;background-color:#111827;border-radius:4px;">
                <tr>
                  <td style="padding:10px 14px;border-bottom:1px solid #1f2937;color:#6b7280;font-size:11px;text-transform:uppercase;">Application ID</td>
                  <td style="padding:10px 14px;border-bottom:1px solid #1f2937;color:#60a5fa;font-size:12px;font-weight:bold;font-family:monospace;">${escapeHtml(applicationId)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;border-bottom:1px solid #1f2937;color:#6b7280;font-size:11px;text-transform:uppercase;">Department</td>
                  <td style="padding:10px 14px;border-bottom:1px solid #1f2937;color:#f9fafb;font-size:12px;font-weight:bold;">${escapeHtml(departmentName)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;color:#6b7280;font-size:11px;text-transform:uppercase;">Date Received</td>
                  <td style="padding:10px 14px;color:#f9fafb;font-size:12px;">${escapeHtml(dateStr)}</td>
                </tr>
              </table>

              <p style="color:#9ca3af;font-size:13px;line-height:1.6;">Our evaluation team is actively reviewing submissions. Further instructions regarding stage progressions will be communicated via this email.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#080808;padding:20px 32px;text-align:center;border-top:1px solid #1f2937;">
              <p style="margin:0;font-size:11px;color:#4b5563;text-transform:uppercase;">Microsoft Innovations Club &bull; Core Team</p>
              <p style="margin:4px 0 0 0;font-size:10px;color:#374151;">Automated notification. Please do not reply directly.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}
