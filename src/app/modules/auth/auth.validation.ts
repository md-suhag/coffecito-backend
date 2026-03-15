import { z } from 'zod';
import { USER_ROLES } from '../user/user.constant';

const createLoginZodSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Not a valid email!')
      .nonempty("Email can't be empty!"),
    password: z
      .string({ required_error: 'Password is required' })
      .nonempty("Password can't be empty!"),
  }),
});

const createForgetPasswordZodSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Not a valid email!')
      .nonempty("Email can't be empty!"),
  }),
});

const createVerifyEmailZodSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Not a valid email!')
      .nonempty("Email can't be empty!"),
    oneTimeCode: z
      .number({ required_error: 'One time code is required' })
      .nonnegative('One time code must be a positive number'),
  }),
});

const createVerifyPhoneZodSchema = z.object({
  body: z.object({
    phone: z
      .string({ message: 'Phone is required' })
      .nonempty('Phone cannot be empty')
      .min(8, 'Phone must be at least 8 characters long')
      .max(15, 'Phone must be at most 15 characters long'),
    oneTimeCode: z.number({ required_error: 'One time code is required' }),
  }),
});
const resendEmailOtpZodSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email({ message: 'Invalid email address' }),
  }),
});

const resendPhoneOtpZodSchema = z.object({
  body: z.object({
    phone: z
      .string({ message: 'Phone is required' })
      .nonempty('Phone cannot be empty')
      .min(8, 'Phone must be at least 8 characters long')
      .max(15, 'Phone must be at most 15 characters long'),
  }),
});

const createResetPasswordZodSchema = z.object({
  body: z.object({
    newPassword: z
      .string({ required_error: 'Password is required' })
      .nonempty("Password can't be empty!")
      .min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z
      .string({
        required_error: 'Confirm Password is required',
      })
      .nonempty("Confirm Password can't be empty!")
      .min(8, 'Confirm Password must be at least 8 characters long'),
  }),
});

const createChangePasswordZodSchema = z.object({
  body: z.object({
    currentPassword: z
      .string({
        required_error: 'Current Password is required',
      })
      .nonempty("Current Password can't be empty!"),
    newPassword: z
      .string({ required_error: 'New Password is required' })
      .nonempty("New Password can't be empty!"),
    confirmPassword: z
      .string({
        required_error: 'Confirm Password is required',
      })
      .nonempty("Confirm Password can't be empty!"),
  }),
});

const googleLoginZodSchema = z.object({
  body: z.object({
    idToken: z.string({ required_error: 'ID token is required' }),
  }),
});

export const AuthValidation = {
  createVerifyEmailZodSchema,
  createVerifyPhoneZodSchema,
  createForgetPasswordZodSchema,
  createLoginZodSchema,
  createResetPasswordZodSchema,
  createChangePasswordZodSchema,
  resendEmailOtpZodSchema,
  resendPhoneOtpZodSchema,
  googleLoginZodSchema,
};
