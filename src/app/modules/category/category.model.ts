import { Query, Schema, model } from 'mongoose';
import { ICategory, CategoryModel } from './category.interface';

const categorySchema = new Schema<ICategory, CategoryModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
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

categorySchema.pre<Query<ICategory, ICategory>>(
  /^find|^count/,
  function (next) {
    const filter = this.getFilter();
    if (filter.isDeleted !== undefined) {
      return next();
    }
    this.where({ isDeleted: { $ne: true } } as any);
    next();
  },
);

export const Category = model<ICategory, CategoryModel>(
  'Category',
  categorySchema,
);
