import { Request, Response, NextFunction } from 'express';
import { AnalyticsServices } from './analytics.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const getSummaryCardsData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = await AnalyticsServices.getSummaryCardsData();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Summary cards fetched successfully',
    data: result,
  });
};

export const AnalyticsController = {
  getSummaryCardsData,
};
