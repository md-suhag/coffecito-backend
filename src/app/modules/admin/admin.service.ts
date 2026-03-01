import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICategory } from '../category/category.interface';
import { Category } from '../category/category.model';

const createCategoryToDB = async (payload: Partial<ICategory>) => {
  const result = await Category.create(payload);
  return result;
};

const updateCategoryToDB = async (id: string, payload: Partial<ICategory>) => {
  const isExistCategory = await Category.findById(id);
  if (!isExistCategory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Category doesn't exist!");
  }
  const result = await Category.findOneAndUpdate({ _id: id }, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

export const AdminServices = {
  createCategoryToDB,
  updateCategoryToDB,
};
