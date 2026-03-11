import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const { ...userData } = req.body;
  const result = await UserService.createUserToDB(userData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User created successfully',
    data: result,
  });
});

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getSingleUserFromDB(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  let profileImage = getSingleFilePath(req.files, 'image');

  let location;
  if (req.body.latitude && req.body.longitude) {
    location = {
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    };
  }

  const data = {
    profileImage,
    location,
    ...req.body,
  };
  const result = await UserService.updateProfileToDB(user, data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile updated successfully',
    data: result,
  });
});

const getMyLoyaltyPoints = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getMyLoyaltyPointsFromDB(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Loyalty points retrieved successfully',
    data: result,
  });
});

const deleteMyAccount = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.deleteMyAccountFromDB(
    req.user.id,
    req.body.password,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Account deleted successfully',
    data: result,
  });
});
export const UserController = {
  createUser,
  getUserProfile,
  updateProfile,
  getMyLoyaltyPoints,
  deleteMyAccount,
};
