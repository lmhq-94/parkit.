/**
 * Sends an administrative invitation email.
 */

const INVITATION_BASE_URL =
  process.env.INVITATION_BASE_URL || "http://localhost:3000";
const FROM_EMAIL =
  process.env.INVITATION_FROM_EMAIL || "Parkit <onboarding@resend.dev>";
const INVITATION_ADMIN_TEMPLATE_ID = process.env.INVITATION_ADMIN_TEMPLATE_ID || process.env.INVITATION_TEMPLATE_ID || "";
/** Same support email as login/support link (e.g. soporte@parkitcr.com). */
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "soporte@parkitcr.com";
/** Optional privacy policy URL */
const PRIVACY_URL = process.env.INVITATION_PRIVACY_URL || "";
/** Optional terms and conditions URL */
const TERMS_URL = process.env.INVITATION_TERMS_URL || "";

export interface SendInvitationAdminParams {
  to: string;
  firstName?: string;
  lastName?: string;
  token?: string;
  /** Company display name (e.g. commercialName or legalName) when inviting to a company; empty for super-admin invite. */
  companyName?: string;
  invitationLink: string;
}

function buildInviteLink(token: string): string {
  const base = INVITATION_BASE_URL.replace(/\/$/, "");
  return `${base}/accept-invite?token=${encodeURIComponent(token)}`;
}

export async function sendInvitationAdminEmail(
  params: SendInvitationAdminParams,
): Promise<{ sent: boolean; error?: string }> {
  const { to, firstName, lastName, token, companyName, invitationLink } = params;

  const isDevelopment = process.env.NODE_ENV !== "production";
  const actualTo = isDevelopment ? "luis.herrera506@gmail.com" : to;

  if (isDevelopment && to !== actualTo) {
    console.log(
      `📧 [DEV MODE] Redirecting invitation email from ${to} → ${actualTo}`,
    );
  }

  const companyDisplay = (companyName || "").trim();
  const inviteLink = invitationLink || buildInviteLink(token || "");

  if (!INVITATION_ADMIN_TEMPLATE_ID) {
    console.error(
      "[Invitation email error] INVITATION_ADMIN_TEMPLATE_ID not configured in environment",
    );
    return { sent: false, error: "INVITATION_ADMIN_TEMPLATE_ID not configured" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "re_xxxxxxxxx") {
    console.log("[Invitation email not sent - no RESEND_API_KEY]");
    console.log(`  Original To: ${to}`);
    console.log(`  Invite link: ${inviteLink}`);
    return { sent: true };
  }

  try {
    const htmlFallback = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="es">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
      @media only screen and (max-width: 480px) {
        .container { width: 100% !important; }
        .content { padding: 30px 20px !important; }
        .brand-text { font-size: 38px !important; }
        .hero { padding: 30px 20px !important; }
      }
    </style>
  </head>
  <body style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0f4f8;">
      <tr>
        <td align="center" style="padding: 40px 10px;">
          
          <table role="presentation" class="container" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.08);">
            
            <tr>
              <td class="hero" style="background: #0f172a; background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%); padding: 40px;">
                <h1 class="brand-text" style="font-size: 42px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: -0.05em;">
                  park<span style="color: #3b82f6;">it.</span>
                </h1>
              </td>
            </tr>
            
            <tr>
              <td class="content" style="padding: 45px 50px 40px;">
                <div style="margin-bottom: 8px; font-size: 12px; font-weight: 700; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.1em;">ACCESO ADMINISTRATIVO</div>
                <h2 style="font-size: 28px; font-weight: 800; margin: 0 0 16px; color: #1e293b; letter-spacing: -0.02em;">Te damos la bienvenida</h2>
                
                <p style="font-size: 16px; line-height: 26px; color: #475569; margin: 0 0 32px;">
                  Has sido invitado a unirte a <strong>${companyDisplay || "Parkit"}</strong> como administrador. 
                  Configura tu contraseña para acceder al dashboard y empezar a gestionar tu operación de la manera más inteligente.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="center">
                      <a href="${inviteLink}" target="_blank" style="display: inline-block; padding: 18px 45px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);">
                        Configurar Acceso
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 24px;">
                  Este enlace caduca pronto por motivos de seguridad.
                </p>
              </td>
            </tr>

            <tr>
              <td style="border-top: 1px solid #f1f5f9; padding: 40px; text-align: center; background-color: #fafbfc;">
                <div style="font-family: 'Inter', Helvetica, Arial, sans-serif;">
                  <p style="margin: 0 0 12px; font-size: 13px; color: #64748b;">
                    ¿Necesitas ayuda? <a href="mailto:${SUPPORT_EMAIL}" style="color: #3b82f6; text-decoration: none; font-weight: 700;">Contacta soporte</a>
                  </p>
                  
                  <p style="margin: 0 0 15px; font-size: 12px; color: #94a3b8;">
                    <a href="${TERMS_URL}" style="color: #94a3b8; text-decoration: underline;">Términos</a> · 
                    <a href="${PRIVACY_URL}" style="color: #94a3b8; text-decoration: underline;">Privacidad</a>
                  </p>

                  <p style="margin: 0; font-size: 11px; color: #cbd5e1; line-height: 1.6; letter-spacing: 0.3px;">
                    © ${new Date().getFullYear()} Parkit. Hecho con ♥ por el <strong>equipo de Parkit</strong>.<br>
                    Atenas, Alajuela, Costa Rica.
                  </p>
                </div>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </body>
</html>`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [actualTo],
        subject: `Invitación Admin a Parkit${companyDisplay ? ` - ${companyDisplay}` : ""}`,
        html: htmlFallback,
        template_id: INVITATION_ADMIN_TEMPLATE_ID,
        template_data: {
          company: companyDisplay || "Parkit",
          url: inviteLink,
          support: SUPPORT_EMAIL,
          privacy: PRIVACY_URL || "",
          terms: TERMS_URL || "",
          first_name: firstName || "",
          full_name: `${firstName} ${lastName}`.trim() || "",
          current_year: new Date().getFullYear(),
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
