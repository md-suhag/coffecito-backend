import QueryBuilder from '../../builder/QueryBuilder';
import { PRODUCT_SEARCHABLE_FIELDS } from './product.constants';
import { IProduct } from './product.interface';
import { Product } from './product.model';
import { Favorite } from '../favorite/favorite.model';
import { CustomizationOption } from '../customizationOption/customizationOption.model';

const createProductIntoDB = async (
  payload: IProduct & { customizationIds?: string[] },
) => {
  if (payload.customizationIds && payload.customizationIds.length > 0) {
    const customizationTemplates = await CustomizationOption.find({
      _id: { $in: payload.customizationIds },
    });

    const customizations = customizationTemplates.map(template => ({
      name: template.name,
      type: template.type as any,
      isRequired: template.isRequired,
      options: template.options.map(opt => ({
        label: opt.label,
        price: opt.price,
      })),
    }));

    payload.customizations = [
      ...(payload.customizations || []),
      ...customizations,
    ];
  }
  const result = await Product.create(payload);
  return result;
};

const getAllProductsFromDB = async (
  query: Record<string, unknown>,
  user: any,
) => {
  const queryObj = { ...query };

  // If user is not super_admin and has a store assigned, restrict to that store
  if (user?.role !== 'super_admin' && user?.store) {
    queryObj.store = user.store;
  }

  const productsQuery = new QueryBuilder(
    Product.find().populate('store', 'name'),
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

const updateProductIntoDB = async (
  id: string,
  payload: Partial<IProduct> & { customizationIds?: string[] },
) => {
  if (payload.customizationIds && payload.customizationIds.length > 0) {
    const customizationTemplates = await CustomizationOption.find({
      _id: { $in: payload.customizationIds },
    });

    const customizations = customizationTemplates.map(template => ({
      name: template.name,
      type: template.type as any,
      isRequired: template.isRequired,
      options: template.options.map(opt => ({
        label: opt.label,
        price: opt.price,
      })),
    }));

    payload.customizations = [
      ...(payload.customizations || []),
      ...customizations,
    ];
  }

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
