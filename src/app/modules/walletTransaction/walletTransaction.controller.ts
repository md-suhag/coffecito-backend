import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { WalletTransactionServices } from './walletTransaction.service';

const getMyWalletTransactions = catchAsync(async (req: Request, res: Response) => {
  const result = await WalletTransactionServices.getMyWalletTransactionsFromDB(
    req.user,
    req.query,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Wallet transactions fetched successfully',
    data: result.transactions,
    pagination: result.meta,
  });
});

const getTransactionDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await WalletTransactionServices.getTransactionDetailsFromDB(
    req.user,
    id,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Transaction details fetched successfully',
    data: result,
  });
});

export const WalletTransactionController = {
  getMyWalletTransactions,
  getTransactionDetails,
};