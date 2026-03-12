import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { NotificationServices } from './notification.service';

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationServices.getMyNotificationsFromDB(req.user.id, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notifications fetched successfully',
    data: result.notifications,
    pagination: result.meta,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationServices.markAsReadIntoDB(req.user.id, req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notification marked as read',
    data: result,
  });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  await NotificationServices.markAllAsReadIntoDB(req.user.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'All notifications marked as read',
    data: null,
  });
});

export const NotificationController = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};