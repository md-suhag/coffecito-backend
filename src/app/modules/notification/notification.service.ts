import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { Notification } from './notification.model';
import { NotificationHelper } from '../../../helpers/notificationHelper';
import { NOTIFICATION_TYPE } from './notification.interface';

const getMyNotificationsFromDB = async (userId: string, query: Record<string, unknown>) => {
  const notificationQuery = new QueryBuilder(
    Notification.find({ receiver: userId }),
    query
  )
    .sort()
    .paginate()
    .fields();

  const [notifications, meta] = await Promise.all([
    notificationQuery.modelQuery,
    notificationQuery.getPaginationInfo(),
  ]);

  return { notifications, meta };
};

const markAsReadIntoDB = async (userId: string, notificationId: string) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, receiver: userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found');
  }

  return notification;
};

const markAllAsReadIntoDB = async (userId: string) => {
  return await Notification.updateMany(
    { receiver: userId, isRead: false },
    { isRead: true }
  );
};

const sendBulkNotification = async (payload: {
  receivers?: string[];
  title: string;
  message: string;
  type: NOTIFICATION_TYPE;
  data?: Record<string, any>;
}) => {
  return await NotificationHelper.sendAndSaveBulkNotification(payload);
};

export const NotificationServices = {
  getMyNotificationsFromDB,
  markAsReadIntoDB,
  markAllAsReadIntoDB,
  sendBulkNotification,
};