import { Model } from 'mongoose';
import { CUSTOMIZATION_OPTION_TYPE } from './customizationOption.constants';

export type ICustomizationOption = {
  name: string;
  type: CUSTOMIZATION_OPTION_TYPE;
  isRequired: boolean;
  options: {
    label: string;
    price: number;
  }[];
  status: boolean;
  isDeleted: boolean;
};

export type CustomizationOptionModel = Model<ICustomizationOption>;
