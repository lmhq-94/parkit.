/**
 * Sends a ticket code email with the parking ticket code for the customer.
 * Uses Resend when RESEND_API_KEY is set; otherwise logs the code to console (dev).
 */

const FROM_EMAIL =
  process.env.TICKET_CODE_FROM_EMAIL || "Parkit <onboarding@resend.dev>";
const TICKET_CODE_TEMPLATE_ID = process.env.TICKET_CODE_TEMPLATE_ID || "";
/** Support email for ticket-related inquiries (e.g. soporte@parkit.app). */
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "soporte@parkit.app";
/** Optional privacy policy URL */
const PRIVACY_URL = process.env.TICKET_CODE_PRIVACY_URL || "";
/** Optional terms and conditions URL */
const TERMS_URL = process.env.TICKET_CODE_TERMS_URL || "";
/** Optional unsubscribe URL */
const UNSUBSCRIBE_URL = process.env.TICKET_CODE_UNSUBSCRIBE_URL || "";

export interface SendTicketCodeParams {
  to: string;
  firstName: string;
  lastName: string;
  ticketCode: string;
  /** Parking location/venue name */
  locationName?: string;
  /** Parking entry date/time (ISO format or formatted string) */
  entryTime?: string;
  /** Optional additional instructions or notes */
  notes?: string;
}

export async function sendTicketCodeEmail(
  params: SendTicketCodeParams,
): Promise<{ sent: boolean; error?: string }> {
  const {
    to,
    firstName,
    lastName,
    ticketCode,
    locationName,
    entryTime,
    notes,
  } = params;

  // In development, redirect all emails to the developer's verified email for Resend testing
  // This allows testing with any email address without domain verification
  const isDevelopment = process.env.NODE_ENV !== "production";
  const actualTo = isDevelopment ? "luis.herrera506@gmail.com" : to;

  if (isDevelopment && to !== actualTo) {
    console.log(
      `🎫 [DEV MODE] Redirecting ticket code email from ${to} → ${actualTo}`,
    );
  }

  const locationDisplay = (locationName || "").trim();

  // Template must be configured in env
  if (!TICKET_CODE_TEMPLATE_ID) {
    console.error(
      "[Ticket code email error] TICKET_CODE_TEMPLATE_ID not configured in environment",
    );
    return { sent: false, error: "TICKET_CODE_TEMPLATE_ID not configured" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "re_xxxxxxxxx") {
    // Development fallback
    console.log("[Ticket code email not sent - no RESEND_API_KEY]");
    console.log(`  Original To: ${to}`);
    console.log(`  Ticket code: ${ticketCode}`);
    if (locationDisplay) console.log(`  Location: ${locationDisplay}`);
    if (entryTime) console.log(`  Entry time: ${entryTime}`);
    return { sent: true };
  }

  try {
    // Resend requires html or text as fallback when using template_id
    // This fallback is specific to ticket code emails for quality UX if template fails
    const htmlFallback = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="es">
  <head>
    <meta content="width=device-width" name="viewport" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta content="IE=edge" http-equiv="X-UA-Compatible" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta
      content="telephone=no,address=no,email=no,date=no,url=no"
      name="format-detection" />
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
      .subtitle { font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 20px; }
      .ticket { background: #f8fafc; border: 1px dashed #cbd5f5; border-radius: 14px; padding: 18px 18px 14px; text-align: center; }
      .ticket-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.18em; color: #64748b; font-weight: 700; margin: 0 0 10px; }
      .ticket-code { font-size: 44px; font-weight: 800; letter-spacing: 6px; color: #0f172a; margin: 0; font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;}
      .ticket-meta { margin-top: 12px; font-size: 12px; color: #64748b; }
      .info { margin-top: 16px; font-size: 12px; line-height: 18px; color: #64748b; }
      .note { margin-top: 16px; font-size: 12px; line-height: 18px; color: #92400e; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 10px 12px; }
      .footer { border-top: 1px solid #eef2f7; padding: 20px 40px 30px; text-align: center; font-size: 12px; color: #94a3b8; }
      .footer a { color: #3b82f6; text-decoration: none; }
      .links a { color: #64748b; text-decoration: underline; margin: 0 6px; }
      @media only screen and (max-width: 480px) {
        .content, .hero, .footer { padding-left: 20px !important; padding-right: 20px !important; }
        .brand { font-size: 36px !important; }
        .title { font-size: 22px !important; }
        .ticket-code { font-size: 34px !important; letter-spacing: 4px !important; }
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
                  <p class="eyebrow">Tiquete digital</p>
                  <h1 class="title">Código de retiro</h1>
                  <p class="subtitle">
                    Tu tiquete digital fue generado con éxito. Presenta este código en la salida para autorizar el retiro del vehículo.
                  </p>
                  <div class="ticket">
                    <p class="ticket-label">Código</p>
                    <p class="ticket-code">${ticketCode}</p>
                    <div class="ticket-meta">
                      ${locationDisplay ? `<div><strong>Ubicación:</strong> ${locationDisplay}</div>` : ""}
                      ${entryTime ? `<div><strong>Entrada:</strong> ${entryTime}</div>` : ""}
                    </div>
                  </div>
                  ${notes ? `<div class="note">${notes}</div>` : ""}
                  <div class="info">
                    * Este código es de uso único. Si tienes inconvenientes, contacta al personal de soporte en sitio.
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
        subject: "Tu código de pase de salida - Parkit",
        html: htmlFallback,
        template_id: TICKET_CODE_TEMPLATE_ID,
        template_data: {
          ticket_code: ticketCode,
          location_name: locationDisplay || "",
          entry_time: entryTime || "",
          notes: notes || "",
          support: SUPPORT_EMAIL,
          privacy: PRIVACY_URL || "",
          terms: TERMS_URL || "",
          unsubscribe: UNSUBSCRIBE_URL || "",
        },
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      const message =
        (result && result.error && result.error.message) || response.statusText;
      console.error("[Ticket code email error]", result);
      return { sent: false, error: message };
    }

    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Ticket code email error]", err);
    return { sent: false, error: message };
  }
}
