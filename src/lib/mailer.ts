import nodemailer from 'nodemailer';

const smtpEmail = process.env.SMTP_EMAIL;
const smtpPassword = process.env.SMTP_PASSWORD;

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Defaulting to Gmail since "app password" usually implies Gmail
  auth: {
    user: smtpEmail,
    pass: smtpPassword,
  },
});

export async function sendApplicationReceipt(userEmail: string, deptName: string) {
  if (!smtpEmail || !smtpPassword) {
    console.warn(`[MAILER] Skipping receipt for ${userEmail}. SMTP credentials are not set.`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"MIC Recruitment" <${smtpEmail}>`,
      to: userEmail,
      subject: `Quest Accepted: ${deptName} Application Received!`,
      html: `
        <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border: 4px solid #000;">
          <h1 style="color: #A93710; text-transform: uppercase;">Application Received!</h1>
          <p>Hello,</p>
          <p>This is a confirmation that your stage 1 application for the <strong>${deptName}</strong> quest at the Microsoft Innovations Club has been successfully submitted.</p>
          <p>Our admins will review your gear and stats. You will receive an update soon!</p>
          <p>Keep checking the portal for your status.</p>
          <br/>
          <p>- MIC Core Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('[MAILER] Failed to send receipt:', error);
  }
}

export async function sendStageUpdate(userEmail: string, status: string, notes?: string) {
  if (!smtpEmail || !smtpPassword) {
    console.warn(`[MAILER] Skipping status update for ${userEmail}. SMTP credentials are not set.`);
    return;
  }

  const isAccepted = status === 'passed';
  const color = isAccepted ? '#10b981' : '#ef4444';
  const title = isAccepted ? 'LEVEL UP! Quest Advanced' : 'GAME OVER: Quest Concluded';
  const body = isAccepted
    ? 'Congratulations! You have successfully passed this stage of the recruitment process. Please check the portal for instructions on the next stage.'
    : 'We appreciate the time you took to apply, but unfortunately, we will not be moving forward with your application for this quest at this time.';

  try {
    await transporter.sendMail({
      from: `"MIC Recruitment" <${smtpEmail}>`,
      to: userEmail,
      subject: title,
      html: `
        <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border: 4px solid ${color};">
          <h1 style="color: ${color}; text-transform: uppercase;">${title}</h1>
          <p>Hello,</p>
          <p>${body}</p>
          ${notes ? `<div style="margin-top: 20px; padding: 15px; background-color: #e2e8f0; border: 2px dashed #000;"><p><strong>Admin Notes:</strong> ${notes}</p></div>` : ''}
          <br/>
          <p>- MIC Core Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('[MAILER] Failed to send stage update:', error);
  }
}
