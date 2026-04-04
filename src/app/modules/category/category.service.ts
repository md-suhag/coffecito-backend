import { Category } from './category.model';

const getAllActiveCategories = async () => {
  const result = await Category.find({ isActive: true }).lean();
  return [{ _id: 'all', name: 'All' }, ...result];
};

export const CategoryServices = {
  getAllActiveCategories,
};
