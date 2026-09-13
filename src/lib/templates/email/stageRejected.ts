import { escapeHtml } from "@/lib/escapeHtml";

export interface StageRejectedEmailProps {
  candidateName: string;
  departmentName: string;
  customNote?: string;
}

export function buildStageRejectedEmail({
  candidateName,
  departmentName,
  customNote,
}: StageRejectedEmailProps): { subject: string; html: string } {
  const subject = `[MIC Recruitment] Application Update - ${departmentName}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Application Status Update</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Courier New',Courier,monospace;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#0a0a0a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;border-radius:4px;overflow:hidden;border:1px solid #1f2937;">
          <tr>
            <td style="background-color:#ef4444;height:4px;font-size:0;line-height:0;">&nbsp;</td>
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
                    <span style="background-color:#451a1a;border:1px solid #ef4444;border-radius:2px;color:#fca5a5;font-size:9px;letter-spacing:1px;padding:4px 8px;text-transform:uppercase;">STATUS UPDATE</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#111827;padding:32px;text-align:center;">
              <span style="background-color:#ef4444;color:#000;font-size:9px;font-weight:bold;letter-spacing:2px;padding:3px 10px;text-transform:uppercase;border-radius:2px;">EVALUATION COMPLETE</span>
              <div style="font-size:22px;font-weight:bold;color:#f9fafb;letter-spacing:2px;margin-top:12px;text-transform:uppercase;">Application Update</div>
              <div style="font-size:12px;color:#9ca3af;margin-top:6px;">Thank you for your interest in joining Microsoft Innovations Club.</div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#0d0d0d;padding:28px 32px;">
              <p style="color:#d1d5db;font-size:14px;line-height:1.6;margin-top:0;">Dear <strong>${escapeHtml(candidateName)}</strong>,</p>
              <p style="color:#9ca3af;font-size:13px;line-height:1.6;">Thank you for investing your time and effort in applying for the <strong>${escapeHtml(departmentName)}</strong> department. After careful evaluation of all submissions, we regret to inform you that we are unable to advance your application to the next stage at this time.</p>

              ${customNote ? `
              <div style="margin:20px 0;padding:14px 16px;background-color:#451a1a;border-left:3px solid #ef4444;border-radius:2px;">
                <div style="font-size:10px;color:#fca5a5;letter-spacing:1px;text-transform:uppercase;font-weight:bold;">Review Note:</div>
                <div style="font-size:13px;color:#fecaca;margin-top:4px;">${escapeHtml(customNote)}</div>
              </div>` : ''}

              <p style="color:#9ca3af;font-size:13px;line-height:1.6;">We encourage you to keep building, participating in our open community events, and apply again in upcoming recruitment cycles!</p>
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
