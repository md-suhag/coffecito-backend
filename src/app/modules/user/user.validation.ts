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

const updateUserZodSchema = z.object({
  body: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
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
        message: 'Address, latitude, and longitude must be provided together',
      },
    ),
});
export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
};
