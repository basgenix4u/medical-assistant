// src/lib/mail/index.ts
/**
 * Mailer abstraction (gap G14).
 * - Development / unconfigured: console mailer (logs the reset link locally).
 * - Production: Resend (https://resend.com) via its HTTP API — no SDK needed.
 */
import { env, isProd } from "@/lib/env";
import { log } from "@/lib/logging";

export interface Mailer {
  sendPasswordReset(to: string, resetUrl: string): Promise<void>;
}

class ConsoleMailer implements Mailer {
  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    if (isProd) {
      log.error({
        msg: "no mail provider configured — password reset email NOT sent",
        to,
      });
      return;
    }
    log.info({
      msg: "password reset email (console mailer — no provider configured)",
      to,
      resetUrl,
    });
  }
}

class ResendMailer implements Mailer {
  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    const apiKey = env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
    const from = env.MAIL_FROM || "MedAssist <onboarding@resend.dev>";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: "Reset your MedAssist password",
        html: [
          "<p>We received a request to reset your MedAssist password.</p>",
          `<p><a href="${resetUrl}">Reset your password</a> — this link expires in 1 hour and can only be used once.</p>`,
          "<p>If you did not request this, you can safely ignore this email.</p>",
        ].join(""),
      }),
    });
    if (!res.ok) {
      throw new Error(`Resend API error: ${res.status}`);
    }
  }
}

let mailer: Mailer | null = null;

export function getMailer(): Mailer {
  if (!mailer) mailer = env.RESEND_API_KEY ? new ResendMailer() : new ConsoleMailer();
  return mailer;
}
