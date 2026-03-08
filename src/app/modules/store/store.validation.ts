import { z } from 'zod';
import { STORE_OPEN_DAY } from './store.constants';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const storeHoursValidationSchema = z.object({
  day: z.nativeEnum(STORE_OPEN_DAY, {
    required_error: 'Day is required',
  }),
  open: z
    .string({ required_error: 'Open time is required' })
    .regex(timeRegex, 'Invalid time format. Use HH:MM in 24-hour format'),
  close: z
    .string({ required_error: 'Close time is required' })
    .regex(timeRegex, 'Invalid time format. Use HH:MM in 24-hour format'),
});

const createStoreValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Store name is required' }),
    address: z.string({ required_error: 'Address is required' }),
    latitude: z.string({ required_error: 'Latitude is required' }),
    longitude: z.string({ required_error: 'Longitude is required' }),
    phone: z.string({ required_error: 'Phone number is required' }),
    hours: z.array(storeHoursValidationSchema).optional(),
    about: z.string().optional(),
  }),
});

export const StoreValidations = {
  createStoreValidationSchema,
};
