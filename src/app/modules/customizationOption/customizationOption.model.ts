import { Schema, model } from 'mongoose';
import {
  CustomizationOptionModel,
  ICustomizationOption,
} from './customizationOption.interface';
import { CUSTOMIZATION_OPTION_TYPE } from './customizationOption.constants';

const customizationOptionSchema = new Schema<
  ICustomizationOption,
  CustomizationOptionModel
>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(CUSTOMIZATION_OPTION_TYPE),
      required: true,
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    options: [
      {
        label: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    status: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Filter out deleted options for find and count queries
customizationOptionSchema.pre(/^find|^count/, function (this: any, next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

customizationOptionSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

export const CustomizationOption = model<
  ICustomizationOption,
  CustomizationOptionModel
>('CustomizationOption', customizationOptionSchema);
