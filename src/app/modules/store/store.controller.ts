import { Request, Response } from 'express';
import { StoreServices } from './store.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';
import { STORE_OPEN_DAY } from './store.constants';

const generateHoursData = (
  openTime?: string,
  closeTime?: string,
  offDay?: string,
) => {
  const ALL_DAYS = [
    STORE_OPEN_DAY.MONDAY,
    STORE_OPEN_DAY.TUESDAY,
    STORE_OPEN_DAY.WEDNESDAY,
    STORE_OPEN_DAY.THURSDAY,
    STORE_OPEN_DAY.FRIDAY,
    STORE_OPEN_DAY.SATURDAY,
    STORE_OPEN_DAY.SUNDAY,
  ];

  let hours: any[] = [];

  if (openTime && closeTime) {
    const formatOffDay: string[] = Array.isArray(offDay) ? offDay : [];
    hours = ALL_DAYS.map(day => ({
      day,
      open: formatOffDay.includes(day) ? null : openTime,
      close: formatOffDay.includes(day) ? null : closeTime,
    }));
  }

  return hours;
};

const createStore = catchAsync(async (req: Request, res: Response) => {
  let image = getSingleFilePath(req.files, 'image');

  const hours = generateHoursData(
    req.body.openTime,
    req.body.closeTime,
    req.body.offDay,
  );
  const data = {
    image,
    hours,
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

  const hours = generateHoursData(
    req.body.openTime,
    req.body.closeTime,
    req.body.offDay,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = image
    ? { image, hours, ...req.body }
    : { hours, ...req.body };

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

const getAllStoresForCustomer = catchAsync(
  async (req: Request, res: Response) => {
    const userId = (req.user as any)?.id;
    const result = await StoreServices.getAllStoresForCustomerFromDB(
      req.query,
      userId,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Stores fetched successfully',
      data: result.stores,
      pagination: result.meta,
    });
  },
);

const connectStripe = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await StoreServices.connectStripeIntoDB(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Stripe connected successfully',
    data: result,
  });
});

const getAllProductsOfAStore = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req.user as any)?.id;
    const result = await StoreServices.getAllProductsOfAStoreFromDB(
      id,
      req.query,
      userId,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Products fetched successfully',
      data: result.products,
      pagination: result.meta,
    });
  },
);

export const StoreController = {
  createStore,
  getAllStores,
  getAllStoresForCustomer,
  updateStore,
  deleteStore,
  connectStripe,
  getAllProductsOfAStore,
};
