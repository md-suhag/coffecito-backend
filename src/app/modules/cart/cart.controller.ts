import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CartServices } from './cart.service';

const getCart = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await CartServices.getCartFromDB(user.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cart fetched successfully',
    data: result,
  });
});

const addToCart = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await CartServices.addToCartIntoDB(user.id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product added to cart successfully',
    data: result,
  });
});

const updateQuantity = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { itemId, quantity } = req.body;
  const result = await CartServices.updateQuantityInDB(
    user.id,
    itemId,
    quantity,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cart quantity updated successfully',
    data: result,
  });
});

const removeItemFromCart = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { itemId } = req.params;
  const result = await CartServices.removeItemFromDB(user.id, itemId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Item removed from cart successfully',
    data: result,
  });
});

const clearCart = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await CartServices.clearCartFromDB(user.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cart cleared successfully',
    data: result,
  });
});

const updateCartAddons = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await CartServices.updateCartAddonsInDB(user.id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cart add-ons updated successfully',
    data: result,
  });
});

const getCartAddonsSummary = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await CartServices.getCartAddonsSummaryFromDB(user.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cart add-ons summary fetched successfully',
    data: result,
  });
});

export const CartController = {
  getCart,
  addToCart,
  updateQuantity,
  removeItemFromCart,
  clearCart,
  updateCartAddons,
  getCartAddonsSummary,
};
