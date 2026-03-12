import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { IPromotions } from './promotions.interface';
import { Promotions } from './promotions.model';

const createPromotionsIntoDB = async (payload: IPromotions) => {
  return await Promotions.create(payload);
};

const getAllPromotionsFromDB = async (query: Record<string, unknown>) => {
  const promotionsQuery = new QueryBuilder(Promotions.find(), query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [result, meta] = await Promise.all([
    promotionsQuery.modelQuery,
    promotionsQuery.getPaginationInfo(),
  ]);

  return { result, meta };
};

const updateStatusIntoDB = async (id: string, isActive: boolean) => {
  const promotion = await Promotions.findByIdAndUpdate(
    id,
    { isActive },
    { new: true }
  );

  if (!promotion) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Promotion not found');
  }

  return promotion;
};

const deletePromotionsFromDB = async (id: string) => {
  const promotion = await Promotions.findByIdAndDelete(id);
  if (!promotion) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Promotion not found');
  }
  return promotion;
};

const getActivePromotionsFromDB = async () => {
  return await Promotions.find({ isActive: true });
};

export const PromotionsServices = {
  createPromotionsIntoDB,
  getAllPromotionsFromDB,
  updateStatusIntoDB,
  deletePromotionsFromDB,
  getActivePromotionsFromDB,
};