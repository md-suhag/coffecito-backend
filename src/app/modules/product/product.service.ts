import QueryBuilder from '../../builder/QueryBuilder';
import { PRODUCT_SEARCHABLE_FIELDS } from './product.constants';
import { IProduct } from './product.interface';
import { Product } from './product.model';
import { Favorite } from '../favorite/favorite.model';
import { CustomizationOption } from '../customizationOption/customizationOption.model';
import { User } from '../user/user.model';

const createProductIntoDB = async (payload: IProduct) => {
  const result = await Product.create(payload);
  return result;
};

const getAllProductsFromDB = async (
  query: Record<string, unknown>,
  user: any,
) => {
  const existingUser = await User.findById(user.id).select('role store').lean();
  const queryObj = { ...query };

  // If user is not super_admin and has a store assigned, restrict to that store
  if (existingUser?.role !== 'super_admin' && existingUser?.store) {
    queryObj.store = existingUser.store;
  }

  const productsQuery = new QueryBuilder(
    Product.find().populate('store', 'name').populate('customizations'),
    queryObj,
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
  const result = await Product.findById(id).populate('customizations').lean();

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
