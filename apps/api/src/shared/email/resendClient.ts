/**
 * Resend email client.
 * Uses RESEND_API_KEY from environment. Never hardcode the API key in code.
 */

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

/** Default "from" when not overridden (Resend onboarding address for testing). */
export const DEFAULT_FROM_EMAIL = "onboarding@resend.dev";

/**
 * Returns a Resend client instance, or null if RESEND_API_KEY is not set.
 * Callers should check for null and handle dev fallback (e.g. log to console).
 */
export function getResendClient(): Resend | null {
  if (!apiKey || apiKey === "re_xxxxxxxxx") {
    return null;
  }
  return new Resend(apiKey);
}

/**
 * Sends an email via Resend. Returns { sent: true } on success, or { sent: false, error } on failure.
 * If RESEND_API_KEY is missing, returns { sent: false, error: "RESEND_API_KEY not set" }.
 */
export async function sendEmail(params: {
  from?: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}): Promise<{ sent: boolean; error?: string }> {
  const client = getResendClient();
  if (!client) {
    return { sent: false, error: "RESEND_API_KEY not set" };
  }

  const to = Array.isArray(params.to) ? params.to : [params.to];
  try {
    const { error } = await client.emails.send({
      from: params.from ?? DEFAULT_FROM_EMAIL,
      to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
    if (error) {
      return { sent: false, error: error.message };
    }
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { sent: false, error: message };
  }
}
