// src/lib/email/index.ts
/**
 * Email service. Falls back to console.log in dev if no API key.
 * Production: set RESEND_API_KEY env var to enable real email delivery.
 */
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const FROM = process.env.EMAIL_FROM || "MedAssist <noreply@medassist.app>";

export async function sendEmail(opts: EmailOptions): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log("\n📧 ===== EMAIL (dev fallback) =====");
    console.log(`  To: ${opts.to}`);
    console.log(`  Subject: ${opts.subject}`);
    if (opts.text) {
      console.log("  --- text ---");
      console.log(opts.text);
    }
    console.log("================================\n");
    return { ok: true, id: "dev-log" };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    if (result.error) return { ok: false, error: result.error.message };
    return { ok: true, id: result.data?.id };
  } catch (e) {
    console.error("Failed to send email:", e);
    return { ok: false, error: e instanceof Error ? e.message : "Email failed" };
  }
}

export function magicLinkEmail(link: string, email: string) {
  return {
    subject: "Sign in to MedAssist",
    html: `<!DOCTYPE html><html><head><style>body{font-family:-apple-system,sans-serif;background:#FDFBF9;margin:0;padding:40px 20px}.c{max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #e8e8e8}.logo{text-align:center;font-size:24px;font-weight:700;color:#452829;margin-bottom:24px}.h{font-size:20px;font-weight:600;color:#1a1a1a;margin-bottom:12px}.t{font-size:15px;color:#404040;line-height:1.6;margin-bottom:24px}.btn{display:inline-block;background:#452829;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px}.f{font-size:12px;color:#8a8a8a;margin-top:24px;text-align:center}.d{font-size:12px;color:#991b1b;background:#fee2e2;padding:12px;border-radius:8px;margin-top:16px}</style></head><body><div class="c"><div class="logo">MedAssist</div><h1 class="h">Sign in to MedAssist</h1><p class="t">Click the button below to sign in to your MedAssist account. This link is valid for 1 hour and can only be used once.</p><p style="text-align:center;margin:32px 0"><a href="${link}" class="btn">Sign in to MedAssist</a></p><p class="t" style="font-size:13px;color:#6b6b6b">Or paste this URL:<br><a href="${link}" style="color:#452829;word-break:break-all">${link}</a></p><div class="d">This email was sent because someone requested to sign in with ${email}. If this wasn't you, ignore this email.</div><div class="f">MedAssist provides general health information only. Not a substitute for medical advice.</div></div></body></html>`,
    text: `Sign in to MedAssist\n\nClick: ${link}\n\nExpires in 1 hour.\n\nIf you didn't request this, ignore this email.`,
  };
}

export function passwordResetEmail(link: string) {
  return {
    subject: "Reset your MedAssist password",
    html: `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;background:#FDFBF9"><div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #e8e8e8"><h1 style="color:#1a1a1a">Reset your password</h1><p style="color:#404040">Click below to set a new password. The link expires in 1 hour.</p><p style="text-align:center;margin:32px 0"><a href="${link}" style="display:inline-block;background:#452829;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600">Reset Password</a></p><p style="color:#8a8a8a;font-size:12px">If you didn't request this, ignore this email. Your password is unchanged.</p></div></body></html>`,
    text: `Reset your MedAssist password\n\nClick: ${link}\n\nLink expires in 1 hour.`,
  };
}
