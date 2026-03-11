import { Request, Response, NextFunction } from 'express';
import { EmailSubscriptionServices } from './emailSubscription.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';

const subscribe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await EmailSubscriptionServices.subscribe(req.body.email);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Email subscribed successfully',
      data: result,
    });
  },
);

const unSubscribe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await EmailSubscriptionServices.unSubscribe(req.body.email);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Email unsubscribed successfully',
      data: result,
    });
  },
);

export const EmailSubscriptionController = {
  subscribe,
  unSubscribe,
};
