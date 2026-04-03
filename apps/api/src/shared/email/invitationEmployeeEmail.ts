/**
 * Sends a corporate benefit invitation email for employees.
 */

const INVITATION_BASE_URL =
  process.env.INVITATION_BASE_URL || "http://localhost:3000";
const FROM_EMAIL =
  process.env.INVITATION_FROM_EMAIL || "Parkit <onboarding@resend.dev>";
const INVITATION_EMPLOYEE_TEMPLATE_ID = process.env.INVITATION_EMPLOYEE_TEMPLATE_ID || "";
/** Same support email as login/support link (e.g. soporte@parkit.app). */
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "soporte@parkit.app";
const APP_STORE_URL = process.env.APP_STORE_URL || "https://apps.apple.com/app/parkit";
const PLAY_STORE_URL = process.env.PLAY_STORE_URL || "https://play.google.com/store/apps/details?id=com.parkit";

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
  const { to, firstName, lastName, token, companyName, invitationLink } = params;

  const isDevelopment = process.env.NODE_ENV !== "production";
  const actualTo = isDevelopment ? "luis.herrera506@gmail.com" : to;

  const companyDisplay = (companyName || "tu empresa").trim();
  const inviteLink = invitationLink || buildInviteLink(token || "");

  if (!INVITATION_EMPLOYEE_TEMPLATE_ID) {
    console.warn(
      "[Invitation email warning] INVITATION_EMPLOYEE_TEMPLATE_ID not configured, using fallback html",
    );
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
        .store-cell { display: block !important; width: 100% !important; padding: 10px 0 !important; }
        .store-button-img { width: 180px !important; height: auto !important; }
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
                <div style="margin-bottom: 8px; font-size: 12px; font-weight: 700; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.1em;">Beneficio Corporativo</div>
                <h2 style="font-size: 28px; font-weight: 800; margin: 0 0 16px; color: #1e293b; letter-spacing: -0.02em;">Tu parqueo está listo.</h2>
                
                <p style="font-size: 16px; line-height: 26px; color: #475569; margin: 0 0 32px;">
                  <strong>${companyDisplay}</strong> te ha invitado a utilizar <strong>Parkit</strong>. Descarga nuestra aplicación para empezar a gestionar tus reservaciones de parqueo de la manera más inteligente y sencilla.
                </p>

                <!-- Sección de Pasos -->
                <div style="background-color: #f8fafc; border-radius: 16px; padding: 25px; margin-bottom: 35px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="padding-bottom: 12px; font-size: 14px; color: #1e293b; font-weight: 600;">
                        <span style="color: #3b82f6; margin-right: 8px;">•</span> Regístrate para activar tu beneficio.
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 12px; font-size: 14px; color: #1e293b; font-weight: 600;">
                        <span style="color: #3b82f6; margin-right: 8px;">•</span> Descarga la app en tu tienda favorita.
                      </td>
                    </tr>
                    <tr>
                      <td style="font-size: 14px; color: #1e293b; font-weight: 600;">
                        <span style="color: #3b82f6; margin-right: 8px;">•</span> Reserva y gestiona tus espacios.
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Botón de Registro -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 32px;">
                  <tr>
                    <td align="center">
                      <a href="${inviteLink}" target="_blank" style="background-color: #3b82f6; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                        Regístrate ahora
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Botones de Tiendas SIMÉTRICOS -->
                <div style="text-align: center; margin-bottom: 10px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                    <tr>
                      <td class="store-cell" align="center" style="padding: 0 8px;">
                        <a href="${APP_STORE_URL}" target="_blank" style="display: inline-block; text-decoration: none;">
                          <img class="store-button-img" src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                               alt="App Store" 
                               width="160" 
                               style="display: block; height: 48px; width: auto; border-radius: 6px;" />
                        </a>
                      </td>
                      <td class="store-cell" align="center" style="padding: 0 8px;">
                        <a href="${PLAY_STORE_URL}" target="_blank" style="display: inline-block; text-decoration: none;">
                          <img class="store-button-img" src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                               alt="Google Play" 
                               width="160" 
                               style="display: block; height: 48px; width: auto; border-radius: 6px;" />
                        </a>
                      </td>
                    </tr>
                  </table>
                </div>

                <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 30px;">
                  Simplifica tu día a día con Parkit.
                </p>
              </td>
            </tr>

            <tr>
              <td style="border-top: 1px solid #f1f5f9; padding: 40px; text-align: center; background-color: #fafbfc;">
                <div style="font-family: 'Inter', Helvetica, Arial, sans-serif;">
                  <p style="margin: 0 0 12px; font-size: 13px; color: #64748b;">
                    ¿Necesitas ayuda? <a href="mailto:${SUPPORT_EMAIL}" style="color: #3b82f6; text-decoration: none; font-weight: 700;">Contacta soporte</a>
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
        subject: `Tu Beneficio de Parqueo en ${companyDisplay} - Parkit`,
        html: htmlFallback,
        template_id: INVITATION_EMPLOYEE_TEMPLATE_ID || undefined,
        template_data: {
          company: companyDisplay,
          url: inviteLink,
          support: SUPPORT_EMAIL,
          app_store_url: APP_STORE_URL,
          play_store_url: PLAY_STORE_URL,
          full_name: `${firstName || ""} ${lastName || ""}`.trim() || "Usuario",
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
