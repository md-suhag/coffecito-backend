import { Request, Response, NextFunction } from 'express';
import { CategoryServices } from './category.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';

const getAllActiveCategories = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CategoryServices.getAllActiveCategories();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Categories fetched successfully',
      data: result,
    });
  },
);

export const CategoryController = {
  getAllActiveCategories,
};
