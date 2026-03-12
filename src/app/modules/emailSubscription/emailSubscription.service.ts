import { emailTemplate } from '../../../shared/emailTemplate';
import { SendGridHelper } from '../../../helpers/sendGridHelper';
import { EmailSubscription } from './emailSubscription.model';

const subscribe = async (email: string) => {
  const subscriber = await EmailSubscription.findOne({ email });

  if (!subscriber) {
    return EmailSubscription.create({
      email,
      isSubscribed: true,
      subscribedAt: new Date(),
    });
  }

  if (subscriber.isSubscribed) {
    throw new Error('Email already subscribed');
  }

  subscriber.isSubscribed = true;
  subscriber.subscribedAt = new Date();
  subscriber.unsubscribedAt = null;

  return subscriber.save();
};

const unSubscribe = async (email: string) => {
  const subscriber = await EmailSubscription.findOne({ email });

  if (!subscriber) {
    throw new Error('Subscriber not found');
  }

  subscriber.isSubscribed = false;
  subscriber.unsubscribedAt = new Date();

  return subscriber.save();
};

const sendEmailToSubscribers = async (payload: {
  subject: string;
  title: string;
  description: string;
  startDate?: string;
  endDate?: string;
}) => {
  const { subject, title, description, startDate, endDate } = payload;

  const query: any = { isSubscribed: true };

  if (startDate || endDate) {
    query.subscribedAt = {};
    if (startDate) query.subscribedAt.$gte = new Date(startDate);
    if (endDate) query.subscribedAt.$lte = new Date(endDate);
  }

  const subscribers = await EmailSubscription.find(query).select('email');
  const emails = subscribers.map(s => s.email);

  if (emails.length === 0) {
    return { message: 'No subscribers found for the given range' };
  }

  // Optimize for scalability: Background Execution & Batching
  const BATCH_SIZE = 500;
  const { html } = emailTemplate.emailCampaign({ title, description });

  // Start sending in background to avoid blocking the server response
  (async () => {
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE);
      try {
        await SendGridHelper.sendBulkEmails(batch, subject, html);
      } catch (error) {
        console.error(`Failed to send email batch starting at ${i}:`, error);
      }
    }
  })().catch(err => {
    console.error('Critical error in email campaign background process:', err);
  });

  return {
    message: `Email campaign started for ${emails.length} subscribers in the background`,
  };
};

export const EmailSubscriptionServices = {
  subscribe,
  unSubscribe,
  sendEmailToSubscribers,
};
