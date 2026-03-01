import { Request, Response, NextFunction } from 'express';
import { AdminServices } from './admin.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.createCategoryToDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Category created successfully',
    data: result,
  });
});

export const AdminController = {
  createCategory,
};
