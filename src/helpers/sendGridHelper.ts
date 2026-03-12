import sgMail from '@sendgrid/mail';
import config from '../config';

sgMail.setApiKey(config.sendgrid_api_key as string);

/**
 * Sends bulk emails using SendGrid.
 * @param to Array of recipient emails.
 * @param subject Email subject.
 * @param html Email body in HTML format.
 */
const sendBulkEmails = async (to: string[], subject: string, html: string) => {
  const msg = {
    to,
    from: config.email.from as string, // Ensure EMAIL_FROM is in .env
    subject,
    html,
  };

  try {
    const result = await sgMail.sendMultiple(msg);
    return result;
  } catch (error: any) {
    if (error.response) {
      console.error(error.response.body);
    }
    throw error;
  }
};

export const SendGridHelper = {
  sendBulkEmails,
};
