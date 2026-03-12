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

const getRevenueByMonth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const year = req.query.year ? Number(req.query.year) : undefined;
  const result = await AnalyticsServices.getRevenueByMonth(year);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Gross revenue by month fetched successfully',
    data: result,
  });
};

export const AnalyticsController = {
  getSummaryCardsData,
  getRevenueByMonth,
};
