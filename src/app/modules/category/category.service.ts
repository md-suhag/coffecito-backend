import { Category } from './category.model';

const getAllActiveCategories = async () => {
  const result = await Category.find({ isActive: true });
  return result;
};

export const CategoryServices = {
  getAllActiveCategories,
};
