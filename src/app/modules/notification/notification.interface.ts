import { Types } from 'mongoose';

export enum NOTIFICATION_TYPE {
  ORDER = 'ORDER',
  PAYMENT = 'PAYMENT',
  PROMOTION = 'PROMOTION',
  SYSTEM = 'SYSTEM',
  DAILY_SPECIAL = 'DAILY_SPECIAL',
  NEW_DRINK = 'NEW_DRINK',
}

export type INotification = {
  receiver: Types.ObjectId;
  title: string;
  message: string;
  type: NOTIFICATION_TYPE;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
};
