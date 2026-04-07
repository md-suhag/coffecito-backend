import { z } from 'zod';
import { USER_STATUS } from './user.constant';

const createUserZodSchema = z.object({
  body: z
    .object({
      name: z.string({ required_error: 'Name is required' }).min(2, {
        message: 'Name must be at least 2 characters long',
      }),
      email: z
        .string({ required_error: 'Email is required' })
        .email({ message: 'Invalid email format' }),
      password: z
        .string({ required_error: 'Password is required' })
        .regex(
          /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-{}[\]:;"'<>,.|/~`]).{8,}$/,
          {
            message:
              'Password must be at least 8 characters long and include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
          },
        ),
    })
    .strict(),
});

const numberFromString = z
  .union([z.number(), z.string()])
  .transform((val, ctx) => {
    const num = typeof val === 'string' ? Number(val) : val;

    if (Number.isNaN(num)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must be a valid number',
      });
      return z.NEVER;
    }

    return num;
  });

const latitude = numberFromString.refine(
  val => val >= -90 && val <= 90,
  'Latitude must be between -90 and 90',
);

const longitude = numberFromString.refine(
  val => val >= -180 && val <= 180,
  'Longitude must be between -180 and 180',
);

const updateUserZodSchema = z.object({
  body: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      latitude: latitude.optional(),
      longitude: longitude.optional(),
      isOnboard: z.boolean().optional(),
      deviceToken: z.string().optional(),
      image: z.string().optional(),
    })
    .strict()
    .refine(
      data => {
        const hasAddress = data.address !== undefined;
        const hasLat = data.latitude !== undefined;
        const hasLng = data.longitude !== undefined;

        return (
          (hasAddress && hasLat && hasLng) ||
          (!hasAddress && !hasLat && !hasLng)
        );
      },
      {
        message: 'address, latitude, and longitude must be provided together',
      },
    ),
});

const deleteMyAccountZodSchema = z.object({
  body: z
    .object({
      password: z.string({ required_error: 'Password is required' }),
    })
    .strict(),
});
export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
  deleteMyAccountZodSchema,
};
