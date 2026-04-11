/**
 * Sends a staff/admin invitation email.
 */

const INVITATION_BASE_URL =
  process.env.INVITATION_BASE_URL || "http://localhost:3000";
const FROM_EMAIL =
  process.env.INVITATION_FROM_EMAIL || "Parkit <onboarding@resend.dev>";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "soporte@parkitcr.com";

export interface SendInvitationStaffParams {
  to: string;
  firstName?: string;
  lastName?: string;
  token?: string;
  companyName?: string;
  invitationLink: string;
}

function buildInviteLink(token: string): string {
  const base = INVITATION_BASE_URL.replace(/\/$/, "");
  return `${base}/accept-invite?token=${encodeURIComponent(token)}`;
}

export async function sendInvitationStaffEmail(
  params: SendInvitationStaffParams,
): Promise<{ sent: boolean; error?: string }> {
  const { to, firstName: _firstName, lastName: _lastName, token, companyName, invitationLink } = params;

  const isDevelopment = process.env.NODE_ENV !== "production";
  const actualTo = isDevelopment ? "luis.herrera506@gmail.com" : to;

  if (isDevelopment && to !== actualTo) {
    console.log(
      `📧 [DEV MODE] Redirecting invitation email from ${to} → ${actualTo}`,
    );
  }

  const companyDisplay = (companyName || "").trim();
  const inviteLink = invitationLink || buildInviteLink(token || "");


  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "re_xxxxxxxxx") {
    console.log("[Invitation email not sent - no RESEND_API_KEY]");
    console.log(`  Original To: ${to}`);
    console.log(`  Invite link: ${inviteLink}`);
    return { sent: true };
  }

  try {
    const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="es">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;450;500;600;650;700&display=swap');
      @media only screen and (max-width: 480px) {
        .container { width: 100% !important; }
        .content { padding: 40px 28px !important; }
        .brand-text { font-size: 32px !important; }
        .hero { padding: 36px 28px !important; }
        h2 { font-size: 22px !important; }
      }
    </style>
  </head>
  <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc;">
      <tr>
        <td align="center" style="padding: 48px 20px;">
          
          <table role="presentation" class="container" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 10px 30px -5px rgba(0,0,0,0.08);">
            
            <tr>
              <td class="hero" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 44px 40px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td>
                      <h1 class="brand-text" style="font-size: 34px; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.02em;">
                        park<span style="color: #2563eb;">it.</span>
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
                      <h2 style="font-size: 22px; font-weight: 600; margin: 0; color: #0f172a; letter-spacing: -0.01em; line-height: 1.3;">Te damos la bienvenida</h2>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 28px;">
                      <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0;">
                        Has sido invitado a unirte a <strong style="color: #0f172a; font-weight: 600;">${companyDisplay || "Parkit"}</strong> con privilegios de administración. Configura tu acceso para empezar a gestionar la plataforma.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 28px;">
                      <p style="font-size: 14px; color: #475569; margin: 0; line-height: 1.6;">
                        <strong>Nota:</strong> Este enlace caduca en 7 días por seguridad.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 20px;">
                      <a href="${inviteLink}" target="_blank" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
                        Configurar acceso
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.5;">
                        ¿No esperabas esta invitación? Simplemente ignora este correo.
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
                      <p style="margin: 0 0 6px; font-size: 14px; color: #64748b;">
                        ¿Necesitas ayuda? <a href="mailto:${SUPPORT_EMAIL}" style="color: #2563eb; text-decoration: none; font-weight: 500;">Contacta soporte</a>
                      </p>
                      <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                        © ${new Date().getFullYear()} Parkit
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
        subject: `Invitación al equipo de Parkit${companyDisplay ? ` - ${companyDisplay}` : ""}`,
        html: html,
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
