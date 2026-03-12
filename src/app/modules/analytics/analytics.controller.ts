import { Request, Response, NextFunction } from 'express';
import { AnalyticsServices } from './analytics.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';

const getSummaryCardsData = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsServices.getSummaryCardsData();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Summary cards fetched successfully',
    data: result,
  });
});

const getRevenueByMonth = catchAsync(async (req: Request, res: Response) => {
  const year = req.query.year ? Number(req.query.year) : undefined;
  const result = await AnalyticsServices.getRevenueByMonth(year);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Gross revenue by month fetched successfully',
    data: result,
  });
});

const getOrdersByCategory = catchAsync(async (req: Request, res: Response) => {
  const range = (req.query.range as any) || 'this-week';
  const result = await AnalyticsServices.getOrdersByCategory(range);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Orders by category fetched successfully',
    data: result,
  });
});

const getRecentOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsServices.getRecentOrdersFromDB();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Recent orders fetched successfully',
    data: result,
  });
});

export const AnalyticsController = {
  getSummaryCardsData,
  getRevenueByMonth,
  getOrdersByCategory,
  getRecentOrders,
};
