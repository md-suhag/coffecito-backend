import { Request, Response } from 'express';
import { StoreServices } from './store.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';

const createStore = catchAsync(async (req: Request, res: Response) => {
  let image = getSingleFilePath(req.files, 'image');

  const data = {
    image,
    ...req.body,
    location: {
      type: 'Point',
      coordinates: [Number(req.body.longitude), Number(req.body.latitude)],
    },
  };
  const result = await StoreServices.createStoreIntoDB(data);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Store created successfully',
    data: result,
  });
});

export const StoreController = {
  createStore,
};
