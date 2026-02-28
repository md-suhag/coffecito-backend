import { Schema, model } from 'mongoose';
import { IProduct, ProductModel } from './product.interface';
import { CUSTOMIZATION_TYPE } from './product.constants';

const optionSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true },
);

const customizationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(CUSTOMIZATION_TYPE),
      required: true,
    },
    isRequired: {
      type: Boolean,
      default: false,
    },

    // For single & multi select
    options: [optionSchema],

    // For quantity type
    pricePerUnit: {
      type: Number,
      min: 0,
    },
  },
  { _id: true },
);

const productSchema = new Schema<IProduct, ProductModel>(
  {
    store: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
    },

    category: {
      type: Schema.Types.ObjectId, // better than String
      ref: 'Category',
      required: true,
      index: true,
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    // Advanced customization engine
    customizations: [customizationSchema],

    dietaryLabels: [
      {
        type: String,
        trim: true,
      },
    ],

    readyTime: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Product = model<IProduct, ProductModel>('Product', productSchema);
