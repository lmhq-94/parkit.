/**
 * Sends an invitation email with a link for the user to set their password.
 * Uses Resend when RESEND_API_KEY is set; otherwise logs the link to console (dev).
 */

import { getResendClient } from "./resendClient";

const INVITATION_BASE_URL =
  process.env.INVITATION_BASE_URL || "http://localhost:3000";
const FROM_EMAIL = process.env.INVITATION_FROM_EMAIL || "Parkit <onboarding@resend.dev>";

export interface SendInvitationParams {
  to: string;
  firstName: string;
  lastName: string;
  token: string;
}

function buildInviteLink(token: string): string {
  const base = INVITATION_BASE_URL.replace(/\/$/, "");
  return `${base}/accept-invite?token=${encodeURIComponent(token)}`;
}

export async function sendInvitationEmail(
  params: SendInvitationParams
): Promise<{ sent: boolean; error?: string }> {
  const { to, firstName, lastName, token } = params;
  const inviteLink = buildInviteLink(token);
  const fullName = `${firstName} ${lastName}`.trim() || "there";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 480px; margin: 0 auto; padding: 24px;">
  <h1 style="font-size: 1.25rem;">You're invited to Parkit</h1>
  <p>Hi ${fullName},</p>
  <p>You've been invited to join Parkit. Click the button below to set your password and activate your account.</p>
  <p style="margin: 28px 0;">
    <a href="${inviteLink}" style="display: inline-block; background: #0ea5e9; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">Set your password</a>
  </p>
  <p style="font-size: 0.875rem; color: #64748b;">This link expires in 72 hours. If you didn't expect this email, you can ignore it.</p>
  <p style="font-size: 0.75rem; color: #94a3b8; word-break: break-all;">If the button doesn't work, copy this link: ${inviteLink}</p>
</body>
</html>
`.trim();

  const client = getResendClient();

  if (!client) {
    // Development: log link so you can test without email configured
    console.log("[Invitation email not sent - no RESEND_API_KEY]");
    console.log(`  To: ${to}`);
    console.log(`  Invite link: ${inviteLink}`);
    return { sent: true };
  }

  try {
    const { error } = await client.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: "You're invited to Parkit – set your password",
      html,
    });

    if (error) {
      console.error("[Invitation email error]", error);
      return { sent: false, error: error.message };
    }
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Invitation email error]", err);
    return { sent: false, error: message };
  }
}
