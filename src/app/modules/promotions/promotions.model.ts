import { Schema, model } from 'mongoose';
import { IPromotions, PromotionsModel } from './promotions.interface';

const promotionsSchema = new Schema<IPromotions, PromotionsModel>(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    url: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Promotions = model<IPromotions, PromotionsModel>(
  'Promotions',
  promotionsSchema,
);
