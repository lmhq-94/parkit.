/**
 * Sends a ticket check-out email (receipt) for the customer.
 */

const FROM_EMAIL =
  process.env.TICKET_CHECKOUT_FROM_EMAIL || "Parkit <onboarding@resend.dev>";
const TICKET_CHECKOUT_TEMPLATE_ID = process.env.TICKET_CHECKOUT_TEMPLATE_ID || "";
/** Support email for ticket-related inquiries (e.g. soporte@parkit.app). */
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "soporte@parkit.app";

export interface SendTicketCheckOutParams {
  to: string;
  firstName: string;
  lastName: string;
  ticketCode: string;
  totalPrice: string;
  totalDuration: string;
  entryTime: string;
  exitTime: string;
  /** Parking location/venue name */
  locationName?: string;
  /** Vehicle plate number */
  plateNumber?: string;
}

export async function sendTicketCheckOutEmail(
  params: SendTicketCheckOutParams,
): Promise<{ sent: boolean; error?: string }> {
  const {
    to,
    firstName,
    lastName,
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

  if (!TICKET_CHECKOUT_TEMPLATE_ID) {
    console.warn(
      "[Ticket check-out email warning] TICKET_CHECKOUT_TEMPLATE_ID not configured, using fallback html",
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "re_xxxxxxxxx") {
    console.log("[Ticket check-out email not sent - no RESEND_API_KEY]");
    console.log(`  Original To: ${to}`);
    console.log(`  Ticket code: ${ticketCode}`);
    console.log(`  Total: ${totalPrice}`);
    return { sent: true };
  }

  try {
    const htmlFallback = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="es">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&family=JetBrains+Mono:wght@800&display=swap');
      @media only screen and (max-width: 480px) {
        .container { width: 100% !important; }
        .content { padding: 30px 20px !important; }
        .ticket-paper { padding: 40px 15px !important; width: 280px !important; }
        .brand-text { font-size: 38px !important; }
      }
    </style>
  </head>
  <body style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0f4f8;">
      <tr>
        <td align="center" style="padding: 40px 10px;">
          
          <table role="presentation" class="container" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.08);">
            
            <tr>
              <td style="background: #0f172a; background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%); padding: 40px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td>
                      <h1 class="brand-text" style="font-size: 42px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: -0.05em;">
                        park<span style="color: #3b82f6;">it.</span>
                      </h1>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td class="content" style="padding: 45px 50px 10px;">
                <div style="margin-bottom: 8px; font-size: 12px; font-weight: 700; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.1em;">Check-out</div>
                <h2 style="font-size: 26px; font-weight: 800; margin: 0 0 12px; color: #1e293b; letter-spacing: -0.02em;">Gracias por su preferencia</h2>
                <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 30px;">
                  Su vehículo ha sido retirado de nuestra custodia. A continuación detallamos el tiempo de permanencia y el monto total calculado por el servicio.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding: 10px 20px 40px;">
                <div class="ticket-paper" style="
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
                  <div style="position: absolute; top: -10px; left: -1px; right: -1px; height: 12px; background-image: radial-gradient(circle at 8px -4px, #ffffff 10px, transparent 11px); background-size: 16px 12px;"></div>

                  <div style="text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 20px; margin-bottom: 25px;">
                    <p style="margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; font-weight: 700;">Detalle de Factura</p>
                    <h3 style="margin: 8px 0 0; font-size: 18px; font-weight: 900; color: #000000; font-family: 'JetBrains Mono', monospace;">${ticketCode}</h3>
                  </div>

                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 25px 5px; margin-bottom: 25px; text-align: center;">
                    <span style="font-size: 9px; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 10px; font-weight: 700;">Monto a Pagar</span>
                    <span style="font-family: 'JetBrains Mono', monospace; font-size: 40px; font-weight: 800; color: #000; line-height: 1;">${totalPrice}</span>
                  </div>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #1a202c;">
                    <tr>
                      <td style="padding: 6px 0; border-bottom: 1px dotted #cbd5e1; text-align: left;">UBICACIÓN:</td>
                      <td style="padding: 6px 0; border-bottom: 1px dotted #cbd5e1; text-align: right; font-weight: bold;">${locationDisplay || "—"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; border-bottom: 1px dotted #cbd5e1; text-align: left;">PLACA:</td>
                      <td style="padding: 6px 0; border-bottom: 1px dotted #cbd5e1; text-align: right; font-weight: bold;">${plateNumber || "—"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; border-bottom: 1px dotted #cbd5e1; text-align: left;">INGRESO:</td>
                      <td style="padding: 6px 0; border-bottom: 1px dotted #cbd5e1; text-align: right; font-weight: bold;">${entryTime}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; border-bottom: 1px dotted #cbd5e1; text-align: left;">SALIDA:</td>
                      <td style="padding: 6px 0; border-bottom: 1px dotted #cbd5e1; text-align: right; font-weight: bold;">${exitTime}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; border-bottom: 1px dotted #cbd5e1; text-align: left; font-weight: bold;">TIEMPO TOTAL:</td>
                      <td style="padding: 10px 0; border-bottom: 1px dotted #cbd5e1; text-align: right; font-weight: bold;">${totalDuration}</td>
                    </tr>
                  </table>

                  <div style="margin: 30px auto 10px; text-align: center;">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticketCode)}&margin=10" 
                         alt="QR de Servicio" 
                         width="130" 
                         height="130" 
                         style="display: block; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 4px;" />
                  </div>

                  <p style="font-size: 10px; color: #64748b; margin: 15px 0 0; text-align: center; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Gracias por su preferencia</p>
                  <div style="position: absolute; bottom: -10px; left: -1px; right: -1px; height: 12px; background-image: radial-gradient(circle at 8px 16px, #ffffff 10px, transparent 11px); background-size: 16px 12px;"></div>
                </div>
              </td>
            </tr>

            <tr>
              <td style="border-top: 1px solid #f1f5f9; padding: 40px; text-align: center; background-color: #fafbfc;">
                <div style="font-family: 'Inter', Helvetica, Arial, sans-serif;">
                  <p style="margin: 0 0 12px; font-size: 13px; color: #64748b;">¿Tienes dudas sobre este resumen? <a href="mailto:${SUPPORT_EMAIL}" style="color: #3b82f6; text-decoration: none; font-weight: 700;">Contacta a soporte</a></p>
                  
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
        subject: `Factura de Parqueo ${ticketCode} - Parkit`,
        html: htmlFallback,
        template_id: TICKET_CHECKOUT_TEMPLATE_ID || undefined,
        template_data: {
          ticket_code: ticketCode,
          total_price: totalPrice,
          total_duration: totalDuration,
          location_name: locationDisplay || "",
          plate_number: plateNumber || "",
          entry_time: entryTime,
          exit_time: exitTime,
          first_name: firstName,
          last_name: lastName,
          support: SUPPORT_EMAIL,
          current_year: new Date().getFullYear(),
        },
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      const message =
        (result && result.error && result.error.message) || response.statusText;
      console.error("[Ticket check-out email error]", result);
      return { sent: false, error: message };
    }

    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Ticket check-out email error]", err);
    return { sent: false, error: message };
  }
}
