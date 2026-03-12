import { Model } from 'mongoose';

export type IPromotions = {
  name: string;
  image: string;
  url?: string;
  isActive: boolean;
};

export type PromotionsModel = Model<IPromotions>;
