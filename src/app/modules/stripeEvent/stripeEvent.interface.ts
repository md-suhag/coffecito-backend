import { Model } from 'mongoose';

export type IStripeEvent = {
  eventId: string;
  type: string;
  isProcessed: boolean;
  processedAt: Date;
};

export type StripeEventModel = Model<IStripeEvent>;
