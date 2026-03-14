import { Model } from 'mongoose';
import { CUSTOMIZATION_OPTION_TYPE } from './customizationOption.constants';

export type ICustomizationOption = {
  name: string;
  price: number;
  type: CUSTOMIZATION_OPTION_TYPE;
  status: boolean;
  isDeleted: boolean;
};

export type CustomizationOptionModel = Model<ICustomizationOption>;
