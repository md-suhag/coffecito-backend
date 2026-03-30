import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
  IVerifyEmail,
  IVerifyPhone,
} from '../../../types/auth';
import cryptoToken from '../../../util/cryptoToken';
import generateOTP from '../../../util/generateOTP';
import { ResetToken } from '../resetToken/resetToken.model';
import { User } from '../user/user.model';
import { AUTH_PROVIDERS, USER_ROLES, USER_STATUS } from '../user/user.constant';
import { smsTemplate } from '../../../shared/smsTemplate';
import { smsHelper } from '../../../helpers/smsHelper';
import { OAuth2Client } from 'google-auth-library';
import { Customer } from '../customer/customer.model';
import mongoose from 'mongoose';

//------------------ login service ------------------
const loginUserFromDB = async (payload: ILoginData) => {
  const { email, password } = payload;
  const isExistUser = await User.findOne({ email }).select('+password');
  if (!isExistUser) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      config.node_env === 'development'
        ? "User doesn't exist!"
        : 'Invalid email or password',
    );
  }

  // check if user is deleted
  if (isExistUser.isDeleted) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'It looks like your account has been deleted or deactivated.',
    );
  }

  //check if user is verified
  if (!isExistUser.isVerified) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please verify your account, then try to login again',
    );
  }

  //check user status
  if (isExistUser.status !== USER_STATUS.ACTIVE) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'It looks like your account has been suspended or deactivated.',
    );
  }

  //check match password
  if (!(await User.isMatchPassword(password, isExistUser?.password ?? ''))) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      config.node_env === 'development'
        ? 'Password is incorrect!'
        : 'Invalid email or password',
    );
  }

  //create access token
  const accessToken = jwtHelper.createToken(
    { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string,
  );

  const lsLocationAdded =
    isExistUser?.location?.latitude && isExistUser?.location?.longitude
      ? true
      : false;
  return {
    accessToken,
    role: isExistUser.role,
    isPhoneVerified: isExistUser.isPhoneVerified,
    lsLocationAdded,
  };
};

//forget password
const forgetPasswordToDB = async (email: string) => {
  const isExistUser = await User.isExistUserByEmail(email);
  if (!isExistUser) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      config.node_env === 'development'
        ? "User doesn't exist!"
        : 'Invalid email',
    );
  }

  // check if user is deleted
  if (isExistUser.isDeleted) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'It looks like your account has been deleted or deactivated.',
    );
  }

  //check user status
  if (isExistUser.status !== USER_STATUS.ACTIVE) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'It looks like your account has been suspended or deactivated.',
    );
  }

  //send mail
  const otp = generateOTP();
  const value = {
    otp,
    email: isExistUser.email,
  };
  const forgetPassword = emailTemplate.resetPassword(value);
  emailHelper.sendEmail(forgetPassword);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findOneAndUpdate({ email }, { $set: { authentication } });
};

//verify email
const verifyEmailToDB = async (payload: IVerifyEmail) => {
  const { email, oneTimeCode } = payload;
  const isExistUser = await User.findOne({ email }).select('+authentication');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!oneTimeCode) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give the otp, check your email we send a code',
    );
  }

  if (isExistUser.authentication?.oneTimeCode !== oneTimeCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You provided wrong otp');
  }

  const date = new Date();
  if (date > isExistUser.authentication?.expireAt) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Otp already expired, Please try again',
    );
  }

  let message;
  let data;

  if (!isExistUser.isVerified) {
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      {
        isVerified: true,
        isEmailVerified: true,
        authentication: { oneTimeCode: null, expireAt: null },
      },
    );
    message = 'Email verify successfully';

    data = jwtHelper.createToken(
      { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
      config.jwt.jwt_secret as Secret,
      config.jwt.jwt_expire_in as string,
    );
  } else {
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      {
        authentication: {
          isResetPassword: true,
          oneTimeCode: null,
          expireAt: null,
        },
      },
    );

    //create token ;
    const createToken = cryptoToken();
    await ResetToken.create({
      user: isExistUser._id,
      token: createToken,
      expireAt: new Date(Date.now() + 5 * 60000),
    });
    message =
      'Verification Successful: Please securely store and utilize this code for reset password';
    data = createToken;
  }
  return { data, message };
};

const verifyPhoneToDB = async (payload: IVerifyPhone) => {
  const { phone, oneTimeCode: otp } = payload;
  const oneTimeCode = Number(otp);
  const isExistUser = await User.findOne({ phone }).select('+authentication');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  if (!isExistUser.authentication?.oneTimeCode) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'No OTP found, please request a new one',
    );
  }

  if (!oneTimeCode) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give the otp, check your phone we send a code',
    );
  }

  // match otp
  if (isExistUser.authentication?.oneTimeCode !== oneTimeCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You provided wrong otp');
  }

  // check expire time
  const date = new Date();
  if (date > isExistUser.authentication?.expireAt) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Otp already expired, Please try again',
    );
  }

  // update user verify and authentication status when otp verify successful
  await User.findOneAndUpdate(
    { _id: isExistUser._id },
    {
      isVerified: true,
      isPhoneVerified: true,
      authentication: { oneTimeCode: null, expireAt: null },
    },
  );

  //create token
  const accessToken = jwtHelper.createToken(
    { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string,
  );

  return {
    accessToken,
  };
};
const resendVerificationEmailToDB = async (email: string) => {
  const existingUser = await User.findOne({ email: email }).lean();

  if (!existingUser) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'User with this email does not exist!',
    );
  }

  // Generate OTP and prepare email
  const otp = generateOTP();
  const emailValues = {
    name: existingUser.name,
    otp,
    email: existingUser.email,
  };

  const resendOtpEmailTemplate = emailTemplate.createAccount(emailValues);
  emailHelper.sendEmail(resendOtpEmailTemplate);

  // Update user with authentication details
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };

  await User.findOneAndUpdate(
    { email: email },
    { $set: { authentication } },
    { new: true },
  );
};

const resendVerificationPhoneOtpToDB = async (phone: string) => {
  const existingUser = await User.findOne({ phone: phone }).lean();

  if (!existingUser) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'User with this phone does not exist!',
    );
  }

  // Generate OTP and prepare email
  const otp = generateOTP();
  const loginOTPTemplate = smsTemplate.sendOtpToPhone({
    otp: otp,
    phone: existingUser.phone!,
  });

  await smsHelper.sendSMS(loginOTPTemplate);
  // Update user with authentication details
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };

  await User.findOneAndUpdate(
    { phone: phone },
    { $set: { authentication } },
    { new: true },
  );
};

//forget password
const resetPasswordToDB = async (
  token: string,
  payload: IAuthResetPassword,
) => {
  const { newPassword, confirmPassword } = payload;
  //isExist token
  const isExistToken = await ResetToken.isExistToken(token);
  if (!isExistToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
  }

  //user permission check
  const isExistUser = await User.findById(isExistToken.user).select(
    '+authentication',
  );
  if (!isExistUser?.authentication?.isResetPassword) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "You don't have permission to change the password. Please click again to 'Forgot Password'",
    );
  }

  //validity check
  const isValid = await ResetToken.isExpireToken(token);
  if (!isValid) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Token expired, Please click again to the forget password',
    );
  }

  //check password
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "New password and Confirm password doesn't match!",
    );
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const updateData = {
    password: hashPassword,
    authentication: {
      isResetPassword: false,
    },
  };

  await User.findOneAndUpdate({ _id: isExistToken.user }, updateData, {
    new: true,
  });
};

const changePasswordToDB = async (
  user: JwtPayload,
  payload: IChangePassword,
) => {
  const { currentPassword, newPassword, confirmPassword } = payload;
  const isExistUser = await User.findById(user.id).select('+password');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //current password match
  if (
    currentPassword &&
    !(await User.isMatchPassword(currentPassword, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
  }

  //newPassword and current password
  if (currentPassword === newPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give different password from current password',
    );
  }
  //new password and confirm password check
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Password and Confirm password doesn't matched",
    );
  }

  //hash password
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const updateData = {
    password: hashPassword,
  };
  await User.findOneAndUpdate({ _id: user.id }, updateData, { new: true });
};

const googleClient = new OAuth2Client(config.social.google_client_id);

//google login
const googleLogin = async (idToken: string) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: config.social.google_client_id,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid Google token');
  }

  if (!payload.email || !payload.email_verified) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      'Unable to authenticate with Google',
    );
  }

  const { email, name, picture, sub } = payload;

  const existingUser = await User.findOne({ email });

  // Prevent Google ID mismatch
  if (existingUser?.googleId && existingUser.googleId !== sub) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      'Unable to authenticate with Google',
    );
  }

  // Existing user flow
  if (existingUser) {
    if (
      !existingUser.googleId &&
      (existingUser.authProviders ?? []).includes(AUTH_PROVIDERS.LOCAL)
    ) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'This account was created using email and password. Please sign in using that method.',
      );
    }

    const accessToken = jwtHelper.createToken(
      {
        id: existingUser._id,
        role: existingUser.role,
        email: existingUser.email,
      },
      config.jwt.jwt_secret as Secret,
      config.jwt.jwt_expire_in as string,
    );

    return { accessToken };
  }

  // Transaction for new user creation
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const newUser = await User.create(
      [
        {
          email,
          name,
          profileImage: picture,
          role: USER_ROLES.CUSTOMER,
          authProviders: [AUTH_PROVIDERS.GOOGLE],
          isVerified: true,
          isEmailVerified: true,
          googleId: sub,
        },
      ],
      { session },
    );

    const customer = await Customer.create(
      [
        {
          user: newUser[0]._id,
        },
      ],
      { session },
    );

    await User.findByIdAndUpdate(
      newUser[0]._id,
      { customer: customer[0]._id },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    const accessToken = jwtHelper.createToken(
      {
        id: newUser[0]._id,
        role: newUser[0].role,
        email: newUser[0].email,
      },
      config.jwt.jwt_secret as Secret,
      config.jwt.jwt_expire_in as string,
    );

    return {
      user: newUser[0],
      accessToken,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const AuthService = {
  verifyEmailToDB,
  verifyPhoneToDB,
  loginUserFromDB,
  forgetPasswordToDB,
  resetPasswordToDB,
  changePasswordToDB,
  resendVerificationEmailToDB,
  resendVerificationPhoneOtpToDB,
  googleLogin,
};
