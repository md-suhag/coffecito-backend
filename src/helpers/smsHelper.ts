import config from '../config';
import { errorLogger, logger } from '../shared/logger';
import twilio from 'twilio';

const client = twilio(config.twilio.account_sid, config.twilio.auth_token);

const sendSMS = async (values: { body: string; from: string; to: string }) => {
  try {
    const message = await client.messages.create({
      body: values.body,
      from: values.from,
      to: values.to,
    });

    logger.info('SMS sent successfully', message.sid);
    return message.sid;
  } catch (error) {
    errorLogger.error('SMS', error);
  }
};

export const smsHelper = {
  sendSMS,
};
