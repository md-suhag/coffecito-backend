import QueryBuilder from '../../builder/QueryBuilder';
import { PRODUCT_SEARCHABLE_FIELDS } from './product.constants';
import { IProduct } from './product.interface';
import { Product } from './product.model';

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

export const ProductServices = {
  createProductIntoDB,
  getAllProductsFromDB,
};
