import { Model, Types } from 'mongoose';
import { AUTH_PROVIDERS, USER_ROLES, USER_STATUS } from './user.constant';

export type IUser = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: USER_ROLES;
  address?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  profileImage?: string;
  customer?: Types.ObjectId;
  permissions?: string[];
  status: USER_STATUS;
  isVerified: boolean;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isDeleted: boolean;
  googleId?: string;
  appleId?: string;
  authProviders?: AUTH_PROVIDERS[];
  authentication?: {
    isResetPassword?: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
  deviceToken?: string;
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
