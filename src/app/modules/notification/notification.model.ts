import { Schema, model } from 'mongoose';
import { INotification, NOTIFICATION_TYPE } from './notification.interface';

const notificationSchema = new Schema<INotification>(
  {
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPE),
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

export const Notification = model<INotification>('Notification', notificationSchema);
