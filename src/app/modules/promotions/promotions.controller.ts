import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { PromotionsServices } from './promotions.service';
import ApiError from '../../../errors/ApiError';

const createPromotions = catchAsync(async (req: Request, res: Response) => {
  const image = getSingleFilePath(req.files, 'image');
  if (!image) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Promotion image is required');
  }

  const result = await PromotionsServices.createPromotionsIntoDB({
    ...req.body,
    image,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Promotion created successfully',
    data: result,
  });
});

const getAllPromotions = catchAsync(async (req: Request, res: Response) => {
  const result = await PromotionsServices.getAllPromotionsFromDB(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Promotions retrieved successfully',
    data: result.result,
    pagination: result.meta,
  });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const result = await PromotionsServices.updateStatusIntoDB(id, isActive);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Promotion status updated successfully',
    data: result,
  });
});

const deletePromotions = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PromotionsServices.deletePromotionsFromDB(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Promotion deleted successfully',
    data: result,
  });
});

const getActivePromotions = catchAsync(async (req: Request, res: Response) => {
  const result = await PromotionsServices.getActivePromotionsFromDB();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Active promotions retrieved successfully',
    data: result,
  });
});

export const PromotionsController = {
  createPromotions,
  getAllPromotions,
  updateStatus,
  deletePromotions,
  getActivePromotions,
};
