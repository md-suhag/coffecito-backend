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

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdminServices.updateCategoryToDB(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Category updated successfully',
    data: result,
  });
});

const contactUs = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.contactUs(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Contact us message sent successfully',
    data: result,
  });
});

export const AdminController = {
  createCategory,
  updateCategory,
  contactUs,
};
