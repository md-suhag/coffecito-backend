import { Schema, model } from 'mongoose';
import { ICustomer, CustomerModel } from './customer.interface';

const customerSchema = new Schema<ICustomer, CustomerModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    favoriteProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    favoriteShops: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Store',
      },
    ],
    subscriptionEmail: {
      type: String,
    },
    isSubscriptionEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastOrderProduct: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    giftCards: [
      {
        type: Schema.Types.ObjectId,
        ref: 'GiftCard',
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Customer = model<ICustomer, CustomerModel>(
  'Customer',
  customerSchema,
);
