import 'dotenv/config';
import { sendInvitationEmail } from '../src/shared/email/invitationEmail';

async function testMultipleEmails() {
  const testEmails = [
    'luis.herrera506@gmail.com',
    'test1@example.com',
    'test2@example.com',
    'admin@parkit.app'
  ];

  console.log('🧪 Testing invitation emails to multiple recipients...\n');

  for (const email of testEmails) {
    console.log(`📧 Sending invitation to: ${email}`);
    try {
      const result = await sendInvitationEmail({
        to: email,
        firstName: 'Test',
        lastName: 'User',
        token: 'test-token-123',
        companyDisplay: 'Parkit Test Company'
      });

      if (result.sent) {
        console.log(`✅ Email sent successfully to ${email}\n`);
      } else {
        console.log(`❌ Failed to send email to ${email}: ${result.error}\n`);
      }
    } catch (error) {
      console.log(`❌ Error sending to ${email}: ${error}\n`);
    }
  }
}

testMultipleEmails().catch(console.error);