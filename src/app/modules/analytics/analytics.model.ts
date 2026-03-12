import { Schema, model } from 'mongoose';
import { IAnalytics, AnalyticsModel } from './analytics.interface';

const analyticsSchema = new Schema<IAnalytics, AnalyticsModel>({
  // Define schema fields here
});

export const Analytics = model<IAnalytics, AnalyticsModel>(
  'Analytics',
  analyticsSchema
);