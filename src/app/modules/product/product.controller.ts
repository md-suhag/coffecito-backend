import { Request, Response } from 'express';
import { ProductServices } from './product.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { USER_ROLES } from '../user/user.constant';

const createProduct = catchAsync(async (req: Request, res: Response) => {
  let image = getSingleFilePath(req.files, 'image');

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const payload = { ...req.body };

  // Logic: Store ID is required for Super Admin, but forced for Admin
  if (user.role === USER_ROLES.SUPER_ADMIN) {
    if (!payload.store) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Store ID is required for Super Admin',
      );
    }
  } else {
    // For Admin and other store roles, always use their own store (ignore body)
    if (!user.store) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Your account is not assigned to any store',
      );
    }
    payload.store = user.store.toString();
  }

  const data = {
    ...payload,
    customizations: payload.customizationIds,
    image,
  };
  const result = await ProductServices.createProductIntoDB(data);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product created successfully',
    data: result,
  });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductServices.getAllProductsFromDB(
    req.query,
    req.user,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Products fetched successfully',
    data: result.products,
    pagination: result.meta,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  let image = getSingleFilePath(req.files, 'image');

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const payload = { ...req.body };

  // Strict store enforcement for update as well
  if (user.role !== USER_ROLES.SUPER_ADMIN) {
    if (user.store) {
      payload.store = user.store.toString();
    }
  }

  const data = {
    ...payload,
    customizations: payload.customizationIds,
    ...(image && { image }),
  };

  const result = await ProductServices.updateProductIntoDB(id, data);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product updated successfully',
    data: result,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductServices.deleteProductFromDB(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product deleted successfully',
    data: result,
  });
});

const getProductById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req.user as any)?.id;
  const result = await ProductServices.getProductByIdFromDB(id, userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product fetched successfully',
    data: result,
  });
});

export const ProductController = {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getProductById,
};
