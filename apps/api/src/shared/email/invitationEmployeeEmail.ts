/**
 * Sends a corporate benefit invitation email for employees.
 */

const INVITATION_BASE_URL =
  process.env.INVITATION_BASE_URL || "http://localhost:3000";
const FROM_EMAIL =
  process.env.INVITATION_FROM_EMAIL || "Parkit <onboarding@resend.dev>";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL;

export interface SendInvitationEmployeeParams {
  to: string;
  firstName?: string;
  lastName?: string;
  token?: string;
  companyName: string;
  invitationLink: string;
}

function buildInviteLink(token: string): string {
  const base = INVITATION_BASE_URL.replace(/\/$/, "");
  return `${base}/accept-invite?token=${encodeURIComponent(token)}`;
}

export async function sendInvitationEmployeeEmail(
  params: SendInvitationEmployeeParams,
): Promise<{ sent: boolean; error?: string }> {
  const { to, firstName: _firstName, lastName: _lastName, token, companyName, invitationLink } = params;

  const isDevelopment = process.env.NODE_ENV !== "production";
  const actualTo = isDevelopment ? "luis.herrera506@gmail.com" : to;

  const companyDisplay = (companyName || "tu empresa").trim();
  const inviteLink = invitationLink || buildInviteLink(token || "");


  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "re_xxxxxxxxx") {
    return { sent: true };
  }

  try {
    const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="es">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@700;900&display=swap');
      @media only screen and (max-width: 480px) {
        .container { width: 100% !important; }
        .content { padding: 40px 28px !important; }
        .brand-text { font-size: 32px !important; }
        .hero { padding: 36px 28px !important; }
        h2 { font-size: 22px !important; }
        .store-badge { height: 38px !important; }
      }
    </style>
  </head>
  <body style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc;">
      <tr>
        <td align="center" style="padding: 48px 20px;">
          
          <table role="presentation" class="container" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 10px 30px -5px rgba(0,0,0,0.08);">
            
            <tr>
              <td class="hero" style="background: linear-gradient(135deg, #0a0a0f 0%, #0f172a 100%); padding: 32px 40px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td>
                      <h1 class="brand-text" style="font-size: 40px; font-weight: 900; color: #ffffff; margin: 0; letter-spacing: -0.06em; line-height: 1.1; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        park<span style="color: #3b82f6;">it.</span>
                      </h1>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <tr>
              <td class="content" style="padding: 44px 40px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding-bottom: 28px;">
                      <h2 style="font-size: 22px; font-weight: 600; margin: 0; color: #0f172a; letter-spacing: -0.01em; line-height: 1.3;">Tu parqueo está listo</h2>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 28px;">
                      <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0;">
                        <strong style="color: #0f172a; font-weight: 600;">${companyDisplay}</strong> te ha invitado a utilizar Parkit. Gestiona tus reservaciones de parqueo de forma inteligente.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 28px;">
                      <p style="margin: 0 0 10px; font-size: 14px; color: #475569; line-height: 1.6;">
                        <strong>1.</strong> Crea tu cuenta haciendo clic en el botón de abajo.<br>
                        <strong>2.</strong> Una vez registrado, te mostraremos cómo descargar la app.<br>
                        <strong>3.</strong> Empieza a reservar y gestionar tus espacios de parqueo.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 20px;">
                      <a href="${inviteLink}" target="_blank" style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
                        Crear mi cuenta →
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.5;">
                        Después de crear tu cuenta, te guiaremos para descargar la aplicación en tu dispositivo.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="border-top: 1px solid #e2e8f0; padding: 28px 40px; background-color: #fafbfc;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="text-align: center;">
                      <p style="margin: 0 0 8px; font-size: 13px; color: #64748b;">
                        ¿Necesitas ayuda? <a href="mailto:${SUPPORT_EMAIL}" style="color: #2563eb; text-decoration: none; font-weight: 500;">Contacta soporte</a>
                      </p>
                      <p style="margin: 0; font-size: 11px; color: #64748b;">
                        © ${new Date().getFullYear()} Parkit. Todos los derechos reservados.
                      </p>
                      <p style="margin: 8px 0 0; font-size: 11px; color: #64748b;">
                        Hecho con <span style="color: #ef4444;">&hearts;</span> por el equipo de Parkit
                      </p>
                    </td>
                  </tr>
                </table>
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
        subject: `Tu Beneficio de Parqueo en ${companyDisplay} - Parkit`,
        html: html,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      const message =
        (result && result.error && result.error.message) || response.statusText;
      return { sent: false, error: message };
    }

    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { sent: false, error: message };
  }
}
