import { ICategory } from '../category/category.interface';
import { Category } from '../category/category.model';

const createCategoryToDB = async (payload: Partial<ICategory>) => {
  const result = await Category.create(payload);
  return result;
};

export const AdminServices = {
  createCategoryToDB,
};
