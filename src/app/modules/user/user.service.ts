import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import { AUTH_PROVIDERS, USER_ROLES } from './user.constant';
import mongoose from 'mongoose';
import { Customer } from '../customer/customer.model';

const createUserToDB = async (payload: Partial<IUser>) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // set default role & provider
    payload.role = USER_ROLES.CUSTOMER;
    payload.authProviders = [AUTH_PROVIDERS.LOCAL];

    // create user
    const createdUser = await User.create([payload], { session });
    const user = createdUser[0];

    if (!user) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
    }

    // generate OTP
    const otp = generateOTP();

    // update authentication field
    user.authentication = {
      oneTimeCode: otp,
      expireAt: new Date(Date.now() + 3 * 60 * 1000),
    };

    await user.save({ session });

    // create customer profile
    const createdCustomer = await Customer.create(
      [
        {
          user: user._id,
        },
      ],
      { session },
    );

    const customer = createdCustomer[0];

    // include customer id in user
    user.customer = customer._id;
    await user.save({ session });

    // commit transaction
    await session.commitTransaction();
    session.endSession();

    // send email AFTER commit
    const values = {
      name: user.name,
      otp,
      email: user.email!,
    };

    const template = emailTemplate.createAccount(values);
    await emailHelper.sendEmail(template);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getSingleUserFromDB = async (id: string): Promise<Partial<IUser>> => {
  const isExistUser = await User.findById(id).populate(
    'customer',
    'loyaltyPoints favoriteShops favoriteProducts isSubscriptionEmailVerified ',
  );
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>,
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  if (payload?.phone && isExistUser.isPhoneVerified === true) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Phone already verified! you can not update phone number',
    );
  }

  //unlink file here
  if (payload.profileImage && isExistUser.profileImage) {
    unlinkFile(isExistUser.profileImage);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const getMyLoyaltyPointsFromDB = async (id: string) => {
  const isExistUser = await User.findById(id).populate(
    'customer',
    'loyaltyPoints',
  );
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return {
    loyaltyPoints: (isExistUser as any)?.customer?.loyaltyPoints || 0,
  };
};

export const UserService = {
  createUserToDB,
  getSingleUserFromDB,
  updateProfileToDB,
  getMyLoyaltyPointsFromDB,
};
