import { Request, Response, NextFunction } from 'express';
import { GiftCardServices } from './giftCard.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createGiftCard = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const result = await GiftCardServices.createGiftCard(req.body, user);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Gift card creation initiated successfully',
      data: result,
    });
  },
);

export const GiftCardController = {
  createGiftCard,
};
