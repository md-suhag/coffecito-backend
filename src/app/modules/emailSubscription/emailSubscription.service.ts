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

  return subscribe;
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

export const EmailSubscriptionServices = {
  subscribe,
  unSubscribe,
};
