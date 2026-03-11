import QueryBuilder from '../../builder/QueryBuilder';
import { PRODUCT_SEARCHABLE_FIELDS } from './product.constants';
import { IProduct } from './product.interface';
import { Product } from './product.model';

import { Favorite } from '../favorite/favorite.model';

const createProductIntoDB = async (payload: IProduct) => {
  const result = await Product.create(payload);
  return result;
};

const getAllProductsFromDB = async (query: Record<string, unknown>) => {
  const productsQuery = new QueryBuilder(
    Product.find().populate('store', 'name'),
    query,
  )
    .search(PRODUCT_SEARCHABLE_FIELDS)
    .filter()
    .sort()
    .paginate();

  const [products, meta] = await Promise.all([
    productsQuery.modelQuery,
    productsQuery.getPaginationInfo(),
  ]);

  return {
    products,
    meta,
  };
};

const updateProductIntoDB = async (id: string, payload: Partial<IProduct>) => {
  const result = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteProductFromDB = async (id: string) => {
  const result = await Product.findByIdAndUpdate(
    id,
    { isDeleted: true },
    {
      new: true,
    },
  );
  return result;
};

const getProductByIdFromDB = async (id: string, userId?: string) => {
  const result = await Product.findById(id).lean();

  if (!result) {
    return null;
  }

  let isFavorite = false;
  if (userId) {
    const favorite = await Favorite.findOne({
      user: userId,
      product: id,
    });
    isFavorite = !!favorite;
  }

  return {
    ...result,
    isFavorite,
  };
};

export const ProductServices = {
  createProductIntoDB,
  getAllProductsFromDB,
  updateProductIntoDB,
  deleteProductFromDB,
  getProductByIdFromDB,
};
