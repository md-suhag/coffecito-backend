import { Request, Response, NextFunction } from 'express';
import { FavoriteServices } from './favorite.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const addFavorite = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await FavoriteServices.addFavorite(req.user.id, req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Added Successfully',
      data: result,
    });
  },
);
const removeFavorite = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await FavoriteServices.removeFavorite(req.user.id, req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Removed Successfully',
      data: result,
    });
  },
);

const getMyFavoriteProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await FavoriteServices.getMyFavoriteProducts(
      req.user.id,
      req.query,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Favorite products retrieved Successfully',
      data: result.favoriteProducts,
      pagination: result.meta,
    });
  },
);

export const FavoriteController = {
  addFavorite,
  removeFavorite,
  getMyFavoriteProducts,
};
