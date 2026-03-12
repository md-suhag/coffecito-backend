import { Request, Response, NextFunction } from 'express';
import { GiftCardServices } from './giftCard.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';

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

const addGiftCard = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const result = await GiftCardServices.addGiftCard(req.body, user);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Gift card added to your account successfully',
      data: result,
    });
  },
);

const getMyGiftCardsData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const result = await GiftCardServices.getMyGiftCardsDataFromDB(user);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Gift cards fetched successfully',
      data: result,
    });
  },
);

const getAllAvailableGiftCards = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await GiftCardServices.getAllAvailableGiftCardsFromDB(
      req.user as JwtPayload,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Gift cards fetched successfully',
      data: result,
    });
  },
);

const getMyAvailableGiftCards = catchAsync(async (req: Request, res: Response) => {
  const result = await GiftCardServices.getMyAvailableGiftCardsFromDB(
    req.user as JwtPayload,
    req.query,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Available gift cards fetched successfully',
    data: result.giftCards,
    pagination: result.meta,
  });
});

const getMySentGiftCards = catchAsync(async (req: Request, res: Response) => {
  const result = await GiftCardServices.getMySentGiftCardsFromDB(
    req.user as JwtPayload,
    req.query,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sent gift cards fetched successfully',
    data: result.giftCards,
    pagination: result.meta,
  });
});

export const GiftCardController = {
  createGiftCard,
  addGiftCard,
  getMyGiftCardsData,
  getAllAvailableGiftCards,
  getMyAvailableGiftCards,
  getMySentGiftCards,
};
