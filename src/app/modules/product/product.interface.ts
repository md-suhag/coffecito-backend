import { Model, Types } from 'mongoose';
import { ICustomizationOption as ICustomizationTemplate } from '../customizationOption/customizationOption.interface';
import { CUSTOMIZATION_TYPE } from './product.constants';

export type IProductCustomizationOptionSnapshot = {
  label: string;
  price: number;
};

export type IProductCustomizationSnapshot = {
  name: string;
  type: CUSTOMIZATION_TYPE;
  isRequired: boolean;
  options?: IProductCustomizationOptionSnapshot[];
  pricePerUnit?: number;
};

export type IProduct = {
  store: Types.ObjectId;
  name: string;
  description: string;
  image: string;
  category: Types.ObjectId;
  basePrice: number;
  customizations: Types.ObjectId[] | ICustomizationTemplate[];
  dietaryLabels: string[];
  readyTime: number; // in minutes
  isActive: boolean;
  isDeleted: boolean;
};

export type ProductModel = Model<IProduct>;
