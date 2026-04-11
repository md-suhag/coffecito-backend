import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IFavorite } from './favorite.interface';
import { Favorite } from './favorite.model';
import QueryBuilder from '../../builder/QueryBuilder';

const addFavorite = async (
  userId: string,
  { product, store }: { product?: string; store?: string },
): Promise<IFavorite> => {
  if (!product && !store) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Product or Store must be provided',
    );
  }

  // Check if favorite already exists
  const existing = await Favorite.findOne({
    user: userId,
    ...(product && { product }),
    ...(store && { store }),
  });

  if (existing) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Already added to favorites');
  }

  const favorite = await Favorite.create({
    user: userId,
    product: product || undefined,
    store: store || undefined,
  });

  return favorite;
};

const removeFavorite = async (
  userId: string,
  { product, store }: { product?: string; store?: string },
) => {
  if (!product && !store) {
    throw new Error('Product or Store must be provided');
  }

  const result = await Favorite.findOneAndDelete({
    user: userId,
    ...(product && { product }),
    ...(store && { store }),
  });

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Favorite not found');
  }

  return result;
};

const getMyFavoriteProducts = async (
  userId: string,
  query: Record<string, any>,
) => {
  const favoriteProductsQuery = new QueryBuilder(
    Favorite.find({ user: userId, product: { $exists: true } }).populate(
      'product',
      'name image basePrice dietaryLabels readyTime',
    ),
    query,
  )
    .sort()
    .paginate();

  const [favoriteProducts, meta] = await Promise.all([
    favoriteProductsQuery.modelQuery.lean(),
    favoriteProductsQuery.getPaginationInfo(),
  ]);

  return {
    favoriteProducts: favoriteProducts.map(item => {
      return {
        ...item,
        isFavorite: true,
      };
    }),
    meta,
  };
};
const getMyFavoriteStores = async (
  userId: string,
  query: Record<string, any>,
) => {
  const favoriteStoresQuery = new QueryBuilder(
    Favorite.find({ user: userId, store: { $exists: true } }).populate(
      'store',
      'name image address  hours ',
    ),
    query,
  )
    .sort()
    .paginate();

  const [favoriteStores, meta] = await Promise.all([
    favoriteStoresQuery.modelQuery.lean(),
    favoriteStoresQuery.getPaginationInfo(),
  ]);

  return {
    favoriteStores: favoriteStores.map(item => {
      return {
        ...item,
        isFavorite: true,
      };
    }),
    meta,
  };
};
export const FavoriteServices = {
  addFavorite,
  removeFavorite,
  getMyFavoriteProducts,
  getMyFavoriteStores,
};
