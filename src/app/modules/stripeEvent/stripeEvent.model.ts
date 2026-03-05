import { Schema, model } from 'mongoose';
import { IStripeEvent, StripeEventModel } from './stripeEvent.interface';

const stripeEventSchema = new Schema<IStripeEvent>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
    },
    isProcessed: {
      type: Boolean,
      default: false,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export const StripeEvent = model<IStripeEvent, StripeEventModel>(
  'StripeEvent',
  stripeEventSchema,
);
