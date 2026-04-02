/**
 * Sends an invitation email with a link for the user to set their password.
 * Uses Resend when RESEND_API_KEY is set; otherwise logs the link to console (dev).
 */

const INVITATION_BASE_URL =
  process.env.INVITATION_BASE_URL || "http://localhost:3000";
const FROM_EMAIL =
  process.env.INVITATION_FROM_EMAIL || "Parkit <onboarding@resend.dev>";
const INVITATION_TEMPLATE_ID = process.env.INVITATION_TEMPLATE_ID || "";
/** Same support email as login/support link (e.g. soporte@parkit.app). */
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "soporte@parkit.app";
/** Optional privacy policy URL */
const PRIVACY_URL = process.env.INVITATION_PRIVACY_URL || "";
/** Optional terms and conditions URL */
const TERMS_URL = process.env.INVITATION_TERMS_URL || "";
/** Optional unsubscribe URL */
const UNSUBSCRIBE_URL = process.env.INVITATION_UNSUBSCRIBE_URL || "";

export interface SendInvitationParams {
  to: string;
  firstName: string;
  lastName: string;
  token: string;
  /** Company display name (e.g. commercialName or legalName) when inviting to a company; empty for super-admin invite. */
  companyName?: string;
}

function buildInviteLink(token: string): string {
  const base = INVITATION_BASE_URL.replace(/\/$/, "");
  return `${base}/accept-invite?token=${encodeURIComponent(token)}`;
}

export async function sendInvitationEmail(
  params: SendInvitationParams,
): Promise<{ sent: boolean; error?: string }> {
  const { to, firstName, lastName, token, companyName } = params;

  // In development, redirect all emails to the developer's verified email for Resend testing
  // This allows testing with any email address without domain verification
  const isDevelopment = process.env.NODE_ENV !== "production";
  const actualTo = isDevelopment ? "luis.herrera506@gmail.com" : to;

  if (isDevelopment && to !== actualTo) {
    console.log(
      `📧 [DEV MODE] Redirecting invitation email from ${to} → ${actualTo}`,
    );
  }

  const companyDisplay = (companyName || "").trim();
  const inviteLink = buildInviteLink(token);

  // Template must be configured in env
  if (!INVITATION_TEMPLATE_ID) {
    console.error(
      "[Invitation email error] INVITATION_TEMPLATE_ID not configured in environment",
    );
    return { sent: false, error: "INVITATION_TEMPLATE_ID not configured" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "re_xxxxxxxxx") {
    // Development fallback
    console.log("[Invitation email not sent - no RESEND_API_KEY]");
    console.log(`  Original To: ${to}`);
    console.log(`  Invite link: ${inviteLink}`);
    return { sent: true };
  }

  try {
    // Resend requires html or text as fallback when using template_id
    // This fallback is specific to invitation emails for quality UX if template fails
    const htmlFallback = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="es">
  <head>
    <meta content="width=device-width" name="viewport" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta content="IE=edge" http-equiv="X-UA-Compatible" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta content="telephone=no,address=no,email=no,date=no,url=no" name="format-detection" />
    <style>
      body, .email-body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f6f8fb;
      }
      .container { width: 100%; max-width: 640px; margin: 0 auto; }
      .card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08); border: 1px solid #eef2f7; }
      .hero { background: linear-gradient(135deg, #0f172a 0%, #111827 45%, #1e293b 100%); padding: 36px 40px; color: #ffffff; }
      .brand { font-size: 44px; font-weight: 700; letter-spacing: -0.04em; margin: 0; }
      .brand .dot { color: #3b82f6; }
      .content { padding: 36px 40px 28px; color: #0f172a; }
      .eyebrow { font-size: 12px; text-transform: uppercase; letter-spacing: 0.16em; color: #94a3b8; margin: 0 0 8px; }
      .title { font-size: 26px; font-weight: 700; margin: 0 0 12px; color: #0f172a; }
      .subtitle { font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 24px; }
      .badge { display: inline-block; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; font-size: 12px; padding: 6px 10px; border-radius: 999px; font-weight: 600; margin-bottom: 16px; }
      .cta-wrap { text-align: center; padding: 18px 0 8px; }
      .cta { background: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; display: inline-block; font-size: 15px; }
      .meta { margin-top: 18px; font-size: 12px; color: #94a3b8; }
      .footer { border-top: 1px solid #eef2f7; padding: 20px 40px 30px; text-align: center; font-size: 12px; color: #94a3b8; }
      .footer a { color: #3b82f6; text-decoration: none; }
      .links a { color: #64748b; text-decoration: underline; margin: 0 6px; }
      @media only screen and (max-width: 480px) {
        .content, .hero, .footer { padding-left: 20px !important; padding-right: 20px !important; }
        .brand { font-size: 36px !important; }
        .title { font-size: 22px !important; }
      }
    </style>
  </head>
  <body>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tbody>
        <tr>
          <td style="padding: 12px;">
            <div class="container">
              <div class="card">
                <div class="hero">
                  <p class="brand"><span style="color:#ffffff">park</span><span class="dot">it.</span></p>
                </div>
                <div class="content">
                  <p class="eyebrow">Invitación</p>
                  <h1 class="title">Te damos la bienvenida</h1>
                  <p class="subtitle">
                    Has sido invitado a unirte a <strong>${companyDisplay || "Parkit"}</strong> como administrador.
                    Configura tu contraseña para acceder al dashboard y empezar a gestionar tu operación.
                  </p>
                  <div class="cta-wrap">
                    <a class="cta" href="${inviteLink}" target="_blank" rel="noopener noreferrer nofollow">Crear contraseña</a>
                    <div class="meta">Este enlace caduca pronto por seguridad.</div>
                  </div>
                </div>
                <div class="footer">
                  <p style="margin: 0 0 10px;">¿Necesitas ayuda? <a href="${SUPPORT_EMAIL}" target="_blank" rel="noopener noreferrer nofollow">Contacta soporte</a></p>
                  <p class="links" style="margin: 0 0 8px;">
                    <a href="${TERMS_URL || "#"}" target="_blank" rel="noopener noreferrer nofollow">Términos</a> ·
                    <a href="${PRIVACY_URL || "#"}" target="_blank" rel="noopener noreferrer nofollow">Privacidad</a>
                  </p>
                  <p style="margin: 0;">© 2026 Parkit Inc. · Atenas, Alajuela, Costa Rica ·
                    <a href="${UNSUBSCRIBE_URL || "#"}" target="_blank" rel="noopener noreferrer nofollow">Darse de baja</a>
                  </p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [actualTo],
        subject: `Invitación a Parkit${companyDisplay ? ` - ${companyDisplay}` : ""}`,
        html: htmlFallback,
        template_id: INVITATION_TEMPLATE_ID,
        template_data: {
          company: companyDisplay || "Parkit",
          url: inviteLink,
          support: SUPPORT_EMAIL,
          privacy: PRIVACY_URL || "",
          terms: TERMS_URL || "",
          unsubscribe: UNSUBSCRIBE_URL || "",
          first_name: firstName || "",
          full_name: `${firstName} ${lastName}`.trim() || "",
        },
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      const message =
        (result && result.error && result.error.message) || response.statusText;
      console.error("[Invitation email error]", result);
      return { sent: false, error: message };
    }

    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Invitation email error]", err);
    return { sent: false, error: message };
  }
}
