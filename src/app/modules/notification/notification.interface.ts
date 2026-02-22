import { Model, Types } from 'mongoose';

export type INotification = {
  type: string;
  title: string;
  message: string;
  receiver: Types.ObjectId;
  referenceId?: Types.ObjectId;
  isRead: boolean;
};

export type NotificationModel = Model<INotification>;
