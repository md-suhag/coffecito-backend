import { Request, Response, NextFunction } from 'express';
import { PointTransactionServices } from './pointTransaction.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const getMyPointTransactions = catchAsync(async (req, res) => {
  const userId = (req.user as any).id;
  const result = await PointTransactionServices.getMyPointTransactionsFromDB(
    userId,
    req.query,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Point transactions retrieved successfully',
    data: result.result,
    pagination: result.meta,
  });
});

export const PointTransactionController = {
  getMyPointTransactions,
};