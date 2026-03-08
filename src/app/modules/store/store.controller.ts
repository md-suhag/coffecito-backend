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

const updateStore = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  let image = getSingleFilePath(req.files, 'image');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = image ? { image, ...req.body } : { ...req.body };

  if (req.body.longitude && req.body.latitude) {
    data.location = {
      type: 'Point',
      coordinates: [Number(req.body.longitude), Number(req.body.latitude)],
    };
  }

  const result = await StoreServices.updateStoreIntoDB(id, data);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Store updated successfully',
    data: result,
  });
});

const deleteStore = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await StoreServices.deleteStoreFromDB(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Store deleted successfully',
    data: result,
  });
});

const getAllStores = catchAsync(async (req: Request, res: Response) => {
  const result = await StoreServices.getAllStoresFromDB(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Stores fetched successfully',
    data: result.stores,
    pagination: result.meta,
  });
});

export const StoreController = {
  createStore,
  getAllStores,
  updateStore,
  deleteStore,
};
