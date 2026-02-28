import { Model, Types } from 'mongoose';
import { CUSTOMIZATION_TYPE } from './product.constants';

export type ICustomizationOption = {
  label: string;
  price: number;
};

export type ICustomization = {
  name: string;
  type: CUSTOMIZATION_TYPE;
  isRequired: boolean;
  options?: ICustomizationOption[];
  pricePerUnit?: number;
};

export type IProduct = {
  store: Types.ObjectId;
  name: string;
  description: string;
  image: string;
  category: Types.ObjectId;
  basePrice: number;
  customizations: ICustomization[];
  dietaryLabels: string[];
  readyTime: number; // in minutes
  isActive: boolean;
};

export type ProductModel = Model<IProduct>;
