import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { GiftCardTransactionServices } from './giftCardTransaction.service';

const getMyGiftCardTransactions = catchAsync(async (req: Request, res: Response) => {
  const result = await GiftCardTransactionServices.getMyGiftCardTransactionsFromDB(
    req.user,
    req.query,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Gift card transactions fetched successfully',
    data: result.transactions,
    pagination: result.meta,
  });
});

export const GiftCardTransactionController = {
  getMyGiftCardTransactions,
};