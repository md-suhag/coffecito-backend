import { Request, Response, NextFunction } from 'express';
import { WalletServices } from './wallet.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const addMoneyIntoWallet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { amount } = req.body;
    const user = req.user;

    const result = await WalletServices.addMoneyIntoWallet(amount, user);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Money added successfully',
      data: result,
    });
  },
);

export const WalletController = {
  addMoneyIntoWallet,
};
