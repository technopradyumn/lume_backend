import nodemailer from "nodemailer";

interface SendResetEmailOptions {
  to: string;
  name: string;
  otp: string;
}

export async function sendPasswordResetEmail({
  to,
  name,
  otp,
}: SendResetEmailOptions): Promise<{ sent: boolean; messageId?: string; previewUrl?: string; error?: string }> {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || "587", 10);
  const from = process.env.EMAIL_FROM || '"Lume Security" <no-reply@lume.app>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Lume Password</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0A0A0F; color: #FFFFFF; margin: 0; padding: 24px; }
          .container { max-width: 540px; margin: 0 auto; background: #13131A; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 36px; }
          .brand { font-size: 22px; font-weight: 800; background: linear-gradient(135deg, #A855F7, #6366F1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 24px; display: inline-block; }
          h1 { font-size: 24px; font-weight: 700; color: #FFFFFF; margin: 0 0 12px 0; }
          p { font-size: 15px; color: #A1A1AA; line-height: 1.6; margin: 0 0 20px 0; }
          .code-box { background: rgba(139, 92, 246, 0.12); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0; }
          .code { font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #C084FC; margin: 0; }
          .expiry { font-size: 13px; color: #71717A; margin-top: 8px; }
          .footer { font-size: 12px; color: #52525B; margin-top: 32px; border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="brand">LUME</div>
          <h1>Password Reset Request</h1>
          <p>Hello ${name || "there"},</p>
          <p>We received a request to reset the password for your Lume account associated with <strong>${to}</strong>. Use the verification code below to complete the reset:</p>
          <div class="code-box">
            <div class="code">${otp}</div>
            <div class="expiry">This code will expire in 15 minutes.</div>
          </div>
          <p>If you did not request a password reset, please ignore this email or reach out to support. Your password will remain unchanged.</p>
          <div class="footer">
            &copy; 2026 Lume Platform. Security &amp; Privacy First.
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `Hello ${name || "there"},\n\nYour Lume password reset code is: ${otp}\n\nThis code will expire in 15 minutes.\nIf you did not request this, please ignore this message.`;

  // Case 1: Real SMTP configured
  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const info = await transporter.sendMail({
        from,
        to,
        subject: "Your Lume Password Reset Code",
        text: textContent,
        html: htmlContent,
      });

      console.log(`[Email Service] Password reset email sent to ${to}: ${info.messageId}`);
      return { sent: true, messageId: info.messageId };
    } catch (err: any) {
      console.error("[Email Service] Failed to send via configured SMTP:", err.message);
      return { sent: false, error: err.message };
    }
  }

  // Case 2: Development / Demo fallback (logs clearly to console)
  console.log("=================================================");
  console.log("   LUME PASSWORD RESET CODE (DEV / SIMULATION)   ");
  console.log(`   To: ${to} (${name})`);
  console.log(`   RESET OTP CODE: [ ${otp} ]`);
  console.log("   Expires in 15 minutes");
  console.log("=================================================");

  // Optional: Try Ethereal test account if in dev
  try {
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await testTransporter.sendMail({
      from,
      to,
      subject: "Your Lume Password Reset Code",
      text: textContent,
      html: htmlContent,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    if (previewUrl) {
      console.log(`[Email Service] Ethereal Preview URL: ${previewUrl}`);
    }
    return { sent: true, messageId: info.messageId, previewUrl };
  } catch {
    // Ethereal unreachable, console log is sufficient
    return { sent: false };
  }
}
