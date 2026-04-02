import "dotenv/config";
import { sendInvitationEmail } from "../src/shared/email/invitationEmail";

async function main() {
  console.log("📧 Probando envío de email de invitación...\n");

  const result = await sendInvitationEmail({
    to: "luis.herrera506@gmail.com",
    firstName: "Luis",
    lastName: "Herrera",
    token: "test-token-12345",
    companyName: "Parkit Co.",
  });

  console.log("\n✅ Resultado:", result);

  if (!result.sent) {
    console.error("❌ Error:", result.error);
    process.exit(1);
  }

  console.log("✨ Email de invitación enviado exitosamente!");
}

main().catch(console.error);
