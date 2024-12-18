import { sendEmail } from '../email';
import { log } from '../../utils/console';

export async function sendBuyerInviteEmail(email: string, password: string, name: string) {
  const subject = 'Buyer Invite';
  const emailTemplate = 'inviteBuyerEmail';

  try {
    const emailResult = await sendEmail(email, subject, emailTemplate, {
      email: email,
      password: password,
      buyer_name: name,
    });

    if (emailResult.success) {
      log(`Email successfully sent to ${email}`, 'GREEN');
    } else {
      console.error(`Failed to send email to ${email}: ${emailResult.error}`);
      // Optional: Implement retry logic or notify an administrator
    }
  } catch (error) {
    console.error(' error', error);
  }
}
