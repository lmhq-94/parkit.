/**
 * Sends a ticket check-out email (receipt) for the customer.
 */

const FROM_EMAIL =
  process.env.TICKET_CHECKOUT_FROM_EMAIL || "Parkit <onboarding@resend.dev>";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL;

export interface SendTicketCheckOutParams {
  to: string;
  firstName: string;
  lastName: string;
  ticketCode: string;
  totalPrice: string;
  totalDuration: string;
  entryTime: string;
  exitTime: string;
  locationName?: string;
  plateNumber?: string;
}

export async function sendTicketCheckOutEmail(
  params: SendTicketCheckOutParams,
): Promise<{ sent: boolean; error?: string }> {
  const {
    to,
    firstName: _firstName,
    lastName: _lastName,
    ticketCode,
    totalPrice,
    totalDuration,
    entryTime,
    exitTime,
    locationName,
    plateNumber,
  } = params;

  const isDevelopment = process.env.NODE_ENV !== "production";
  const actualTo = isDevelopment ? "luis.herrera506@gmail.com" : to;

  const locationDisplay = (locationName || "").trim();

 
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
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@700;900&family=JetBrains+Mono:wght@500;600&display=swap');
      @media only screen and (max-width: 480px) {
        .container { width: 100% !important; }
        .content { padding: 40px 28px !important; }
        .brand-text { font-size: 32px !important; }
        .receipt-card { padding: 28px 24px !important; }
        .amount { font-size: 26px !important; }
      }
    </style>
  </head>
  <body style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc;">
      <tr>
        <td align="center" style="padding: 48px 20px;">
          
          <table role="presentation" class="container" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 10px 30px -5px rgba(0,0,0,0.08);">
            
            <tr>
              <td style="background: linear-gradient(135deg, #0a0a0f 0%, #0f172a 100%); padding: 32px 40px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
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
              <td class="content" style="padding: 44px 40px 32px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding-bottom: 24px;">
                      <h2 style="font-size: 22px; font-weight: 600; margin: 0; color: #0f172a; letter-spacing: -0.01em; line-height: 1.3;">Gracias por tu preferencia</h2>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 32px;">
                      <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0;">
                        Tu vehículo ha sido retirado exitosamente. A continuación el resumen de tu servicio.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 10px 0 40px;">
                      <table role="presentation" class="ticket-paper" cellspacing="0" cellpadding="0" border="0" style="
                        background-color: #fefefe;
                        background-image: radial-gradient(#e5e7eb 0.7px, transparent 0);
                        background-size: 10px 10px;
                        position: relative;
                        padding: 50px 30px;
                        border-left: 1px solid #e2e8f0;
                        border-right: 1px solid #e2e8f0;
                        box-shadow: 0 15px 35px rgba(0,0,0,0.07);
                        max-width: 320px;
                      ">
                        <tr>
                          <td style="position: relative;">
                            <div style="position: absolute; top: -60px; left: -31px; right: -31px; height: 12px; background-image: radial-gradient(circle at 8px -4px, #ffffff 10px, transparent 11px); background-size: 16px 12px;"></div>
                            
                            <div style="text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 20px; margin-bottom: 25px;">
                              <p style="margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; font-weight: 700;">Factura de Servicio</p>
                              <h3 style="margin: 8px 0 0; font-size: 18px; font-weight: 800; color: #000000; font-family: 'JetBrains Mono', monospace;">${ticketCode}</h3>
                            </div>

                            <div style="background: #f0fdf4; border: 2px solid #86efac; padding: 25px 5px; margin-bottom: 25px; text-align: center;">
                              <span style="font-size: 9px; text-transform: uppercase; color: #166534; display: block; margin-bottom: 10px; font-weight: 700;">Monto Total Pagado</span>
                              <span style="font-family: 'JetBrains Mono', monospace; font-size: 40px; font-weight: 800; color: #166534; line-height: 1;">${totalPrice}</span>
                            </div>

                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #1a202c;">
                              <tr>
                                <td style="padding: 8px 0; border-bottom: 1px dotted #cbd5e1; text-align: left;">UBICACIÓN:</td>
                                <td style="padding: 8px 0; border-bottom: 1px dotted #cbd5e1; text-align: right; font-weight: bold;">${locationDisplay || "—"}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; border-bottom: 1px dotted #cbd5e1; text-align: left;">PLACA:</td>
                                <td style="padding: 8px 0; border-bottom: 1px dotted #cbd5e1; text-align: right; font-weight: bold;">${plateNumber || "—"}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; border-bottom: 1px dotted #cbd5e1; text-align: left;">INGRESO:</td>
                                <td style="padding: 8px 0; border-bottom: 1px dotted #cbd5e1; text-align: right; font-weight: bold;">${entryTime}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; border-bottom: 1px dotted #cbd5e1; text-align: left;">SALIDA:</td>
                                <td style="padding: 8px 0; border-bottom: 1px dotted #cbd5e1; text-align: right; font-weight: bold;">${exitTime}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; text-align: left; font-weight: bold;">DURACIÓN:</td>
                                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${totalDuration}</td>
                              </tr>
                            </table>

                            <div style="margin-top: 25px; text-align: center; padding-top: 20px; border-top: 2px dashed #cbd5e1;">
                              <p style="font-size: 9px; color: #64748b; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Gracias por su preferencia</p>
                            </div>
                            
                            <div style="position: absolute; bottom: -60px; left: -31px; right: -31px; height: 12px; background-image: radial-gradient(circle at 8px 16px, #ffffff 10px, transparent 11px); background-size: 16px 12px;"></div>
                          </td>
                        </tr>
                      </table>
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
        subject: `Factura de Parqueo ${ticketCode} - Parkit`,
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
