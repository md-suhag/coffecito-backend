import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICategory } from '../category/category.interface';
import { Category } from '../category/category.model';
import { IContactUs } from '../contactUs/contactUs.interface';
import { ContactUs } from '../contactUs/contactUs.model';
import { emailTemplate } from '../../../shared/emailTemplate';
import { emailHelper } from '../../../helpers/emailHelper';

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

const contactUs = async (payload: IContactUs) => {
  const result = await ContactUs.create(payload);
  const contactUsEmailTemplate = emailTemplate.contactUs(payload);
  await emailHelper.sendEmail(contactUsEmailTemplate);
  return result;
};
export const AdminServices = {
  createCategoryToDB,
  updateCategoryToDB,
  contactUs,
};
