import { Model, Types } from 'mongoose';

export type IProductVariant = {
  size: string;
  price: number;
};

export type IProduct = {
  store: Types.ObjectId;
  name: string;
  description: string;
  image: string;
  category: string;
  addOns: string[];
  variants: IProductVariant[];
  dietaryLabels: string[];
  readyTime: number; // in minutes
  isActive: boolean;
};

export type ProductModel = Model<IProduct>;
