/**
 * Sends an invitation email with a link for the user to set their password.
 * Uses Resend when RESEND_API_KEY is set; otherwise logs the link to console (dev).
 */

import { getResendClient } from "./resendClient";

const INVITATION_BASE_URL =
  process.env.INVITATION_BASE_URL || "http://localhost:3000";
const FROM_EMAIL = process.env.INVITATION_FROM_EMAIL || "Parkit <onboarding@resend.dev>";
/** Same support email as login/support link (e.g. soporte@parkit.app). */
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "soporte@parkit.app";
/** Optional logo URL for email header (if set, shown left in header). */
const PARKIT_LOGO_URL = process.env.PARKIT_LOGO_URL || "";

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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendInvitationEmail(
  params: SendInvitationParams
): Promise<{ sent: boolean; error?: string }> {
  const { to, firstName, lastName, token, companyName } = params;
  const inviteLink = buildInviteLink(token);
  const fullName = `${firstName} ${lastName}`.trim() || "ahí";
  const companyDisplay = (companyName || "").trim();

  // Preheader: short text some clients show as preview (keep under ~130 chars)
  const preheader = companyDisplay
    ? `Te han invitado a ${companyDisplay} en Parkit. Crea tu contraseña.`
    : `Crea tu contraseña y únete a Parkit.`;

  // Parkit design tokens (from apps/web: globals.css + themeDefaults — light theme)
  const pageBg = "#f1f5f9";
  const cardBorder = "rgba(0, 0, 0, 0.08)";
  const textPrimary = "#0f172a";
  const textSecondary = "#475569";
  const textMuted = "#64748b";
  const companyPrimary = "#2563eb"; // blue-600, logo "it." (same as sidebar)
  const supportMailto = `mailto:${SUPPORT_EMAIL}`;
  // Inter: professional font, highly legible in emails (Google Fonts)
  const fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  // Header logo: larger size. If image, ~56px height; if "park"+"it." text, 2.25rem
  const headerLogoHtml = PARKIT_LOGO_URL
    ? `<img src="${PARKIT_LOGO_URL}" alt="Parkit" width="168" height="56" style="display: block; max-height: 56px; width: auto;" />`
    : `<span class="logo-text" style="font-size: 2.25rem; font-weight: 700; letter-spacing: -0.03em; line-height: 1.2;"><span style="color: ${textPrimary};">park</span><span style="color: ${companyPrimary};">it.</span></span>`;

  const companyEscaped = escapeHtml(companyDisplay);
  const fullNameEscaped = escapeHtml(fullName);
  const inviteIntro = companyDisplay
    ? `Te han invitado a unirte a <strong>${companyEscaped}</strong> en Parkit. Haz clic en el botón de abajo para crear tu contraseña y activar tu cuenta.`
    : `Te han invitado a unirte a Parkit. Haz clic en el botón de abajo para crear tu contraseña y activar tu cuenta.`;
  const inviteIntroPlain = companyDisplay
    ? `Te han invitado a unirte a ${companyDisplay} en Parkit.`
    : `Te han invitado a unirte a Parkit.`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Invitación a Parkit</title>
  <!--[if mso]>
  <noscript><meta http-equiv="X-UA-Compatible" content="IE=edge"></noscript>
  <![endif]-->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    .preheader { display: none !important; visibility: hidden; max-height: 0; overflow: hidden; }
    body, .email-body { font-family: ${fontFamily}; }
    @media only screen and (max-width: 480px) {
      .card { border-radius: 12px !important; padding: 16px !important; }
      .btn { padding: 14px 20px !important; font-size: 16px !important; }
      .logo-text { font-size: 1.75rem !important; }
    }
  </style>
</head>
<body class="email-body" style="margin: 0; padding: 0; font-family: ${fontFamily}; background-color: ${pageBg}; line-height: 1.6; color: ${textPrimary};">
  <div class="preheader">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${pageBg}; padding: 24px 16px;">
    <tr>
      <td align="center" style="width: 100%;">
        <table role="presentation" class="card" width="100%" cellpadding="0" cellspacing="0" style="max-width: 100%; width: 100%; background: #ffffff; border-radius: 16px; border: 1px solid ${cardBorder}; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.04); overflow: hidden; font-family: ${fontFamily};">
          <tr>
            <td style="padding: 24px 32px; text-align: left; border-bottom: 1px solid ${cardBorder}; font-family: ${fontFamily};">
              ${headerLogoHtml}
            </td>
          </tr>
          <tr>
            <td style="padding: 32px; font-family: ${fontFamily};">
              <h1 style="margin: 0 0 8px; font-size: 1.375rem; font-weight: 600; color: ${textPrimary};">Estás invitado</h1>
              <p style="margin: 0 0 24px; font-size: 0.9375rem; color: ${textMuted};">${companyDisplay ? `Únete a Parkit y empieza a gestionar estacionamientos.` : "Únete a tu equipo y empieza a gestionar estacionamientos."}</p>
              <p style="margin: 0 0 24px; font-size: 1rem; color: ${textSecondary};">Hola ${fullNameEscaped},</p>
              <p style="margin: 0 0 28px; font-size: 1rem; color: ${textSecondary};">${inviteIntro}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <a href="${inviteLink}" class="btn" style="display: inline-block; background: ${companyPrimary}; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 0.875rem;">Crear contraseña</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 28px 0 0; font-size: 0.875rem; color: ${textMuted};">Este enlace caduca en 72 horas. Si no esperabas este correo, puedes ignorarlo.</p>
              <p style="margin: 16px 0 0; font-size: 0.8125rem; color: ${textMuted};">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
              <p style="margin: 8px 0 0; font-size: 0.75rem; color: ${textMuted}; word-break: break-all;">${inviteLink}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background: ${pageBg}; border-top: 1px solid ${cardBorder}; font-family: ${fontFamily};">
              <p style="margin: 0; font-size: 0.75rem; color: ${textMuted}; text-align: center;">Este correo fue enviado por Parkit. Si tienes preguntas, contacta a <a href="${supportMailto}" style="color: ${companyPrimary}; text-decoration: none;">soporte de Parkit</a>.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  const text = `Invitación a Parkit

Hola ${fullName},

${inviteIntroPlain} Crea tu contraseña y activa tu cuenta visitando este enlace:

${inviteLink}

Este enlace caduca en 72 horas. Si no esperabas este correo, puedes ignorarlo.

Si tienes preguntas, contacta a soporte: ${SUPPORT_EMAIL}

— Parkit`;

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
      subject: "Invitación a Parkit – crea tu contraseña",
      html,
      text,
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
