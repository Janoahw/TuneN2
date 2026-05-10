import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email via Resend API.
 * Falls back to console logging in development when no API key is set.
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  if (!env.RESEND_API_KEY) {
    logger.info(
      { to: options.to, subject: options.subject },
      'Email (dev mode — no RESEND_API_KEY): would send email',
    );
    logger.debug({ html: options.html }, 'Email body');
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    logger.error({ status: res.status, body }, 'Failed to send email via Resend');
    throw new Error(`Email send failed: ${res.status}`);
  }

  logger.info({ to: options.to, subject: options.subject }, 'Email sent');
}

export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Your TuneN2 Verification Code',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background: #0A0A0F; color: #fff;">
        <h1 style="color: #6C5CE7; font-size: 28px; margin-bottom: 8px;">TuneN2</h1>
        <p style="color: #A0A0B0; font-size: 14px; margin-bottom: 32px;">Where independent music gets paid.</p>
        <h2 style="font-size: 20px; margin-bottom: 16px;">Verify your email</h2>
        <p style="color: #A0A0B0; line-height: 1.6;">Enter this code in the TuneN2 app to verify your email address:</p>
        <div style="margin: 32px 0; padding: 24px; background: #1A1A20; border-radius: 12px; text-align: center;">
          <code style="font-size: 32px; letter-spacing: 8px; color: #6C5CE7; font-family: 'Monaco', 'Courier New', monospace; font-weight: 600;">${otp}</code>
        </div>
        <p style="color: #A0A0B0; font-size: 13px;">This code expires in 10 minutes.</p>
        <p style="color: #666680; font-size: 12px; margin-top: 32px;">If you didn't request this code, you can safely ignore this email.</p>
      </div>
    `,
    text: `Your TuneN2 verification code: ${otp}\n\nThis code expires in 10 minutes.`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${env.APP_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Reset your TuneN2 password',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background: #0A0A0F; color: #fff;">
        <h1 style="color: #6C5CE7; font-size: 28px; margin-bottom: 8px;">TuneN2</h1>
        <p style="color: #A0A0B0; font-size: 14px; margin-bottom: 32px;">Where independent music gets paid.</p>
        <h2 style="font-size: 20px; margin-bottom: 16px;">Reset your password</h2>
        <p style="color: #A0A0B0; line-height: 1.6;">Click the button below to set a new password for your account.</p>
        <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 14px 32px; background: #6C5CE7; color: #fff; text-decoration: none; border-radius: 24px; font-weight: 600;">Reset Password</a>
        <p style="color: #666680; font-size: 12px; margin-top: 32px;">If you didn't request a password reset, you can safely ignore this email.</p>
        <p style="color: #666680; font-size: 12px;">This link expires in 1 hour.</p>
      </div>
    `,
    text: `Reset your TuneN2 password: ${resetUrl}`,
  });
}
