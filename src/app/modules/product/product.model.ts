import { Schema, model } from 'mongoose';
import { IProduct, ProductModel } from './product.interface';
import { CUSTOMIZATION_TYPE } from './product.constants';

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
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    customizations: [
      {
        type: Schema.Types.ObjectId,
        ref: 'CustomizationOption',
      },
    ],

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
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Filter out deleted products for find and count queries
productSchema.pre(/^find|^count/, function (this: any, next) {
  const filter = this.getFilter();
  if (filter.isDeleted !== undefined) {
    return next();
  }
  this.where({ isDeleted: { $ne: true } } as any);
  next();
});

productSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

export const Product = model<IProduct, ProductModel>('Product', productSchema);
