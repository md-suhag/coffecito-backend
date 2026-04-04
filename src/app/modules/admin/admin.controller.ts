import { Request, Response, NextFunction } from 'express';
import { AdminServices } from './admin.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { AUTH_PROVIDERS } from '../user/user.constant';

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getAllCategoriesFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Categories fetched successfully',
    data: result.categories,
    pagination: result.meta,
  });
});

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

const softDeleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdminServices.softDeleteCategoryFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Category deleted successfully',
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
  const result = await AdminServices.getAllOrdersFromDB(req.query, req.user);

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

const createUser = catchAsync(async (req: Request, res: Response) => {
  const data = {
    ...req.body,
    isVerified: true,
    isEmailVerified: true,
    authProviders: [AUTH_PROVIDERS.LOCAL],
  };
  const result = await AdminServices.createUserToDB(data);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User created successfully',
    data: result,
  });
});

const getAllCreatedUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getAllCreatedUsersFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Users fetched successfully',
    data: result.users,
    pagination: result.meta,
  });
});

const getRevenue = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getRevenue(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Revenue fetched successfully',
    data: result.revenue,
    pagination: result.meta,
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
  createUser,
  getRevenue,
  getAllCategories,
  softDeleteCategory,
  getAllCreatedUsers,
};
