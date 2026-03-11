/**
 * Sends a test email via Resend (e.g. "Hello World").
 * Loads .env from the api folder. Replace re_xxxxxxxxx with your real API key in .env:
 *
 *   RESEND_API_KEY=re_your_actual_key_here
 *
 * Run from apps/api: npm run email:test
 */
import "dotenv/config";
import { sendEmail } from "../src/shared/email/resendClient";

const TO_EMAIL = "luis.herrera506@gmail.com";

async function main() {
  const result = await sendEmail({
    from: "onboarding@resend.dev",
    to: TO_EMAIL,
    subject: "Hello World",
    html: '<p>Congrats on sending your <strong>first email</strong>!</p>',
  });

  if (result.sent) {
    console.log("Email sent successfully to", TO_EMAIL);
  } else {
    console.error("Failed to send email:", result.error);
    if (result.error?.includes("RESEND_API_KEY")) {
      console.error("\nAdd your Resend API key to .env: RESEND_API_KEY=re_xxxxxxxxx");
      console.error("Replace re_xxxxxxxxx with your real API key from https://resend.com/api-keys");
    }
    process.exit(1);
  }
}

main();
