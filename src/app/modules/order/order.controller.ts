import { Request, Response, NextFunction } from 'express';
import { OrderServices } from './order.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderServices.createOrderIntoDB(req.user.id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Order placed successfully',
    data: result,
  });
});

const getMyUpcomingOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderServices.getMyUpcomingOrdersFromDB(
    req.user.id,
    req.query,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Upcoming orders fetched successfully',
    data: result.orders,
    pagination: result.meta,
  });
});

const getMyCompletedOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderServices.getMyCompletedOrdersFromDB(
    req.user.id,
    req.query,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Completed orders fetched successfully',
    data: result.orders,
    pagination: result.meta,
  });
});

const getMyOrderDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderServices.getMyOrderDetailsFromDB(
    req.user.id,
    req.params.id,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Order fetched successfully',
    data: result,
  });
});

const getLastOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await OrderServices.getLastOrderFromDB(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Last order fetched successfully',
    data: result,
  });
});

export const OrderController = {
  createOrder,
  getMyUpcomingOrders,
  getMyCompletedOrders,
  getMyOrderDetails,
  getLastOrder,
};
