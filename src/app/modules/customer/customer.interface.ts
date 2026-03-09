import { Model, Types } from 'mongoose';

export type ICustomer = {
  user: Types.ObjectId;
  loyaltyPoints: number;
  favoriteProducts: Types.ObjectId[];
  favoriteShops: Types.ObjectId[];
  subscriptionEmail?: string;
  isSubscriptionEmailVerified: boolean;
  lastOrderProduct?: Types.ObjectId;
  giftCards: Types.ObjectId[];
};

export type CustomerModel = Model<ICustomer>;
