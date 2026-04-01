/**
 * Test script to send a sample ticket code email
 * Run from apps/api directory: npx ts-node --transpile-only scripts/send-test-ticket-code.ts
 */
require("dotenv/config");

import { sendTicketCodeEmail } from "../src/shared/email/ticketCodeEmail";

async function main() {
  console.log("Sending test ticket code email...\n");

  const result = await sendTicketCodeEmail({
    to: process.env.TEST_EMAIL || "luis.herrera506@gmail.com",
    firstName: "Luis",
    lastName: "Herrera",
    ticketCode: "ABC123XYZ",
    locationName: "Centro Comercial Parkit",
    entryTime: new Date().toLocaleString("es-ES"),
    notes: "Tu pase de salida es válido por 24 horas.",
  });

  console.log("\nResult:", result);
  if (result.sent) {
    console.log("✅ Email enviado exitosamente!");
  } else {
    console.log("❌ Error al enviar email:", result.error);
  }
}

main().catch(console.error);
