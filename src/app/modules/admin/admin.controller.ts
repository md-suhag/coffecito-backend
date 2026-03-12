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

const getAllCustomers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getAllCustomers(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Customers fetched successfully',
    data: result.customers,
    pagination: result.meta,
  });
});

const updateCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdminServices.updateCustomer(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Customer updated successfully',
    data: result,
  });
});

const getAllSubscribers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getAllSubscribers(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Subscribers fetched successfully',
    data: result.subscribers,
    pagination: result.meta,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getAllOrdersFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Orders fetched successfully',
    data: result.orders,
    pagination: result.meta,
  });
});

const updateOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdminServices.updateOrderFromDB(id, req.body.status);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Order updated successfully',
    data: result,
  });
});

export const AdminController = {
  createCategory,
  updateCategory,
  contactUs,
  getAllCustomers,
  updateCustomer,
  getAllSubscribers,
  getAllOrders,
  updateOrder,
};
