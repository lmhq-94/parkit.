/**
 * Email con enlace para restablecer contraseña (olvido de contraseña).
 * Misma base URL que invitaciones: INVITATION_BASE_URL + /reset-password?token=
 */

import { getResendClient } from "./resendClient";

const BASE_URL = process.env.INVITATION_BASE_URL || "http://localhost:3000";
const FROM_EMAIL = process.env.INVITATION_FROM_EMAIL || "Parkit <onboarding@resend.dev>";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "soporte@parkit.app";
const PARKIT_LOGO_URL = process.env.PARKIT_LOGO_URL || "";

function buildResetLink(token: string): string {
  const base = BASE_URL.replace(/\/$/, "");
  return `${base}/reset-password?token=${encodeURIComponent(token)}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendPasswordResetEmail(params: {
  to: string;
  firstName: string;
  lastName: string;
  token: string;
}): Promise<{ sent: boolean; error?: string }> {
  const { to, firstName, lastName, token } = params;
  const resetLink = buildResetLink(token);
  const fullName = `${firstName} ${lastName}`.trim() || "ahí";
  const fullNameEscaped = escapeHtml(fullName);
  const companyPrimary = "#2563eb";
  const textPrimary = "#0f172a";
  const textSecondary = "#475569";
  const textMuted = "#64748b";
  const pageBg = "#f1f5f9";
  const cardBorder = "rgba(0, 0, 0, 0.08)";
  const supportMailto = `mailto:${SUPPORT_EMAIL}`;
  const fontFamily =
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  const headerLogoHtml = PARKIT_LOGO_URL
    ? `<img src="${PARKIT_LOGO_URL}" alt="Parkit" width="168" height="56" style="display: block; max-height: 56px; width: auto;" />`
    : `<span style="font-size: 2.25rem; font-weight: 700; letter-spacing: -0.03em;"><span style="color: ${textPrimary};">park</span><span style="color: ${companyPrimary};">it.</span></span>`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:${fontFamily};background:${pageBg};color:${textPrimary};line-height:1.6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${pageBg};padding:24px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:16px;border:1px solid ${cardBorder};">
        <tr><td style="padding:24px 32px;border-bottom:1px solid ${cardBorder};">${headerLogoHtml}</td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 8px;font-size:1.375rem;font-weight:600;">Restablecer contraseña</h1>
          <p style="margin:0 0 24px;color:${textMuted};font-size:0.9375rem;">Parkit · recuperación de acceso</p>
          <p style="margin:0 0 24px;color:${textSecondary};">Hola ${fullNameEscaped},</p>
          <p style="margin:0 0 28px;color:${textSecondary};">Recibimos una solicitud para cambiar tu contraseña. Si fuiste tú, pulsa el botón. Si no, ignora este correo.</p>
          <a href="${resetLink}" style="display:inline-block;background:${companyPrimary};color:#fff!important;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:0.875rem;">Restablecer contraseña</a>
          <p style="margin:28px 0 0;font-size:0.875rem;color:${textMuted};">El enlace caduca en 24 horas.</p>
          <p style="margin:16px 0 0;font-size:0.8125rem;color:${textMuted};word-break:break-all;">${resetLink}</p>
        </td></tr>
        <tr><td style="padding:20px 32px;background:${pageBg};border-top:1px solid ${cardBorder};text-align:center;">
          <p style="margin:0;font-size:0.75rem;color:${textMuted};">¿Dudas? <a href="${supportMailto}" style="color:${companyPrimary};text-decoration:none;">Soporte Parkit</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

  const text = `Restablecer contraseña — Parkit

Hola ${fullName},

Para elegir una nueva contraseña, abre este enlace (válido 24 horas):

${resetLink}

Si no solicitaste el cambio, ignora este mensaje.

Soporte: ${SUPPORT_EMAIL}`;

  const client = getResendClient();
  if (!client) {
    console.log("[Password reset email not sent - no RESEND_API_KEY]");
    console.log(`  To: ${to}`);
    console.log(`  Reset link: ${resetLink}`);
    return { sent: true };
  }

  try {
    const { error } = await client.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: "Parkit – restablecer contraseña",
      html,
      text,
    });
    if (error) {
      console.error("[Password reset email error]", error);
      return { sent: false, error: error.message };
    }
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Password reset email error]", err);
    return { sent: false, error: message };
  }
}
