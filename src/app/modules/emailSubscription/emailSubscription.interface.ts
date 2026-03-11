import { Model } from 'mongoose';

export interface IEmailSubscription {
  email: string;
  isSubscribed: boolean;
  subscribedAt: Date;
  unsubscribedAt: Date | null;
}

export type EmailSubscriptionModel = Model<IEmailSubscription>;
