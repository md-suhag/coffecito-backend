import { Request, Response } from 'express';
import { ProductServices } from './product.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';

const createProduct = catchAsync(async (req: Request, res: Response) => {
  let image = getSingleFilePath(req.files, 'image');

  const data = {
    image,
    ...req.body,
  };
  const result = await ProductServices.createProductIntoDB(data);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product created successfully',
    data: result,
  });
});

export const ProductController = {
  createProduct,
};
