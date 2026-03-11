import { Schema, model } from 'mongoose';
import {
  IEmailSubscription,
  EmailSubscriptionModel,
} from './emailSubscription.interface';

const emailSubscriptionSchema = new Schema<
  IEmailSubscription,
  EmailSubscriptionModel
>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isSubscribed: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export const EmailSubscription = model<
  IEmailSubscription,
  EmailSubscriptionModel
>('EmailSubscription', emailSubscriptionSchema);
