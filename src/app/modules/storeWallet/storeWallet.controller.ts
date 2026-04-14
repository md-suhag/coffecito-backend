import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { StoreWalletServices } from './storeWallet.service';

const getAllStoreWallets = catchAsync(async (req: Request, res: Response) => {
  const result = await StoreWalletServices.getAllStoreWalletsFromDB(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Store wallets retrieved successfully',
    data: result.wallets,
    pagination: result.meta,
  });
});

const getStoreWalletByStoreId = catchAsync(
  async (req: Request, res: Response) => {
    const result = await StoreWalletServices.getStoreWalletByStoreIdFromDB(
      req.params.storeId,
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Store wallet retrieved successfully',
      data: result,
    });
  },
);

const getStoreTransactions = catchAsync(
  async (req: Request, res: Response) => {
    const result = await StoreWalletServices.getStoreTransactionsFromDB(
      req.params.storeId,
      req.query,
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Store transactions retrieved successfully',
      data: result.transactions,
      pagination: result.meta,
    });
  },
);

const processPayout = catchAsync(async (req: Request, res: Response) => {
  const { amount, note } = req.body;
  const result = await StoreWalletServices.processPayoutFromDB(
    req.params.storeId,
    amount,
    note,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payout processed successfully',
    data: result,
  });
});

export const StoreWalletController = {
  getAllStoreWallets,
  getStoreWalletByStoreId,
  getStoreTransactions,
  processPayout,
};
