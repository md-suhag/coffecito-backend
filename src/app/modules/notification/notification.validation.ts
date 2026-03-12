import { z } from 'zod';
import { NOTIFICATION_TYPE } from './notification.interface';

const sendNotificationZodSchema = z.object({
  body: z.object({
    receivers: z.array(z.string()).optional(),
    title: z.string({ required_error: 'Title is required' }),
    message: z.string({ required_error: 'Message is required' }),
    type: z.nativeEnum(NOTIFICATION_TYPE, { required_error: 'Type is required' }),
    data: z.record(z.any()).optional(),
  }),
});

export const NotificationValidations = {
  sendNotificationZodSchema,
};