import { Schema, model } from 'mongoose';
import { IFavorite, FavoriteModel } from './favorite.interface';

const favoriteSchema = new Schema<IFavorite, FavoriteModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
    },
  },
  { timestamps: true },
);

favoriteSchema.index(
  { user: 1, product: 1 },
  { unique: true, partialFilterExpression: { product: { $exists: true } } },
);
favoriteSchema.index(
  { user: 1, store: 1 },
  { unique: true, partialFilterExpression: { store: { $exists: true } } },
);

export const Favorite = model<IFavorite, FavoriteModel>(
  'Favorite',
  favoriteSchema,
);
