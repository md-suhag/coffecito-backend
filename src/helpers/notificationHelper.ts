import admin from 'firebase-admin';
import config from '../config';
import { Notification } from '../app/modules/notification/notification.model';
import { NOTIFICATION_TYPE } from '../app/modules/notification/notification.interface';
import { User } from '../app/modules/user/user.model';

import path from 'path';

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccountPath = config.firebase.serviceAccountPath;
  if (serviceAccountPath) {
    const serviceAccount = require(path.resolve(process.cwd(), serviceAccountPath));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT_PATH not found in environment variables.');
  }
}

const sendPushNotification = async (
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  if (!token || !admin.apps.length) return;

  const message = {
    notification: { title, body },
    data: data || {},
    token: token,
  };

  try {
    return await admin.messaging().send(message);
  } catch (error) {
    console.error('Error sending single push notification:', error);
  }
};

const sendBulkPushNotification = async (
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  if (!tokens || tokens.length === 0 || !admin.apps.length) return;

  const message = {
    notification: { title, body },
    data: data || {},
    tokens: tokens,
  };

  try {
    return await admin.messaging().sendEachForMulticast(message);
  } catch (error) {
    console.error('Error sending bulk push notification:', error);
  }
};

/**
 * Sends a push notification and saves it to the database for a single user.
 */
const sendAndSaveNotification = async (payload: {
  receiver: string;
  title: string;
  message: string;
  type: NOTIFICATION_TYPE;
  data?: Record<string, any>;
}) => {
  const { receiver, title, message, type, data } = payload;

  try {
    // 1. Save to Database
    await Notification.create({
      receiver,
      title,
      message,
      type,
      data,
    });

    // 2. Fetch User's Device Token
    const user = await User.findById(receiver).select('deviceToken');
    if (user?.deviceToken) {
      // 3. Send Push Notification
      await sendPushNotification(user.deviceToken, title, message, data as any);
    }
  } catch (error) {
    console.error('Error in sendAndSaveNotification:', error);
  }
};

/**
 * Sends notifications to all users (or filtered) and saves to DB for each.
 * Optimized with Batching (500 users at a time) to prevent memory bloat.
 */
const sendAndSaveBulkNotification = async (payload: {
  receivers?: string[]; // If empty, send to ALL active users
  title: string;
  message: string;
  type: NOTIFICATION_TYPE;
  data?: Record<string, any>;
}) => {
  const { receivers, title, message, type, data } = payload;

  try {
    const BATCH_SIZE = 500;
    
    if (receivers && receivers.length > 0) {
      // Process specific receivers in chunks
      for (let i = 0; i < receivers.length; i += BATCH_SIZE) {
        const batchIds = receivers.slice(i, i + BATCH_SIZE);
        
        // 1. Bulk Save to DB
        const notifications = batchIds.map(userId => ({
          receiver: userId,
          title,
          message,
          type,
          data,
        }));
        await Notification.insertMany(notifications);

        // 2. Fetch Tokens for this batch
        const usersWithTokens = await User.find({
          _id: { $in: batchIds },
          deviceToken: { $ne: null },
          isDeleted: false,
        }).select('deviceToken');

        const tokens = usersWithTokens.map(u => u.deviceToken as string);

        // 3. Send Multicast Push
        if (tokens.length > 0) {
          await sendBulkPushNotification(tokens, title, message, data as any);
        }
      }
    } else {
      // Process ALL active users using Cursor (Most Memory Efficient)
      const userCursor = User.find({ isDeleted: false, status: 'active' })
        .select('_id deviceToken')
        .cursor();

      let currentBatchIds: string[] = [];
      let currentBatchTokens: string[] = [];

      for (let user = await userCursor.next(); user != null; user = await userCursor.next()) {
        currentBatchIds.push(user._id.toString());
        if (user.deviceToken) currentBatchTokens.push(user.deviceToken);

        if (currentBatchIds.length === BATCH_SIZE) {
          // Process current batch
          await processBatch(currentBatchIds, currentBatchTokens, title, message, type, data);
          currentBatchIds = [];
          currentBatchTokens = [];
        }
      }

      // Process remaining users
      if (currentBatchIds.length > 0) {
        await processBatch(currentBatchIds, currentBatchTokens, title, message, type, data);
      }
    }
  } catch (error) {
    console.error('Error in sendAndSaveBulkNotification:', error);
  }
};

/**
 * Helper to process a batch of notifications
 */
const processBatch = async (
  userIds: string[],
  tokens: string[],
  title: string,
  message: string,
  type: NOTIFICATION_TYPE,
  data?: any
) => {
  // 1. Save to DB
  const notifications = userIds.map(userId => ({
    receiver: userId,
    title,
    message,
    type,
    data,
  }));
  await Notification.insertMany(notifications);

  // 2. Send Push
  if (tokens.length > 0) {
    await sendBulkPushNotification(tokens, title, message, data);
  }
};

export const NotificationHelper = {
  sendPushNotification,
  sendBulkPushNotification,
  sendAndSaveNotification,
  sendAndSaveBulkNotification,
};
