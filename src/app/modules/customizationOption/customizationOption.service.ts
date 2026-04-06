import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import ApiError from '../../../errors/ApiError';
import { CUSTOMIZATION_OPTION_SEARCHABLE_FIELDS } from './customizationOption.constants';
import { ICustomizationOption } from './customizationOption.interface';
import { CustomizationOption } from './customizationOption.model';

const createCustomizationOptionIntoDB = async (payload: ICustomizationOption) => {
  const result = await CustomizationOption.create(payload);
  return result;
};

const getAllCustomizationOptionsFromDB = async (
  query: Record<string, unknown>,
) => {
  const customizationOptionQuery = new QueryBuilder(
    CustomizationOption.find(),
    query,
  )
    .search(CUSTOMIZATION_OPTION_SEARCHABLE_FIELDS)
    .filter()
    .sort()
    .paginate();

  const [result, meta] = await Promise.all([
    customizationOptionQuery.modelQuery,
    customizationOptionQuery.getPaginationInfo(),
  ]);

  return { result, meta };
};

const getSingleCustomizationOptionFromDB = async (id: string) => {
  const result = await CustomizationOption.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Customization option not found');
  }
  return result;
};

const updateCustomizationOptionIntoDB = async (
  id: string,
  payload: Partial<ICustomizationOption>,
) => {
  const result = await CustomizationOption.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Customization option not found');
  }
  return result;
};

const deleteCustomizationOptionFromDB = async (id: string) => {
  const result = await CustomizationOption.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Customization option not found');
  }
  return result;
};

const addOptionToCategoryInDB = async (
  id: string,
  payload: { label: string; price: number },
) => {
  const result = await CustomizationOption.findByIdAndUpdate(
    id,
    {
      $push: { options: payload },
    },
    { new: true, runValidators: true },
  );
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Customization category not found');
  }
  return result;
};

const updateOptionInCategoryInDB = async (
  id: string,
  optionId: string,
  payload: { label?: string; price?: number },
) => {
  const updateData: any = {};
  if (payload.label) updateData['options.$.label'] = payload.label;
  if (payload.price !== undefined) updateData['options.$.price'] = payload.price;

  const result = await CustomizationOption.findOneAndUpdate(
    { _id: id, 'options._id': optionId },
    {
      $set: updateData,
    },
    { new: true, runValidators: true },
  );
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Customization category or option not found',
    );
  }
  return result;
};

const removeOptionFromCategoryFromDB = async (id: string, optionId: string) => {
  const result = await CustomizationOption.findByIdAndUpdate(
    id,
    {
      $pull: { options: { _id: optionId } },
    },
    { new: true },
  );
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Customization category not found');
  }
  return result;
};

export const CustomizationOptionServices = {
  createCustomizationOptionIntoDB,
  getAllCustomizationOptionsFromDB,
  getSingleCustomizationOptionFromDB,
  updateCustomizationOptionIntoDB,
  deleteCustomizationOptionFromDB,
  addOptionToCategoryInDB,
  updateOptionInCategoryInDB,
  removeOptionFromCategoryFromDB,
};
