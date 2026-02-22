import { Schema, model } from 'mongoose';
import { IStore, StoreModel } from './store.interface';

const hoursSchema = new Schema(
  {
    day: {
      type: String,
      required: true,
      trim: true,
    },
    open: {
      type: String,
      required: true,
    },
    close: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const storeSchema = new Schema<IStore, StoreModel>(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        default: 'Point',
      },
      coordinates: [Number],
    },
    phone: {
      type: String,
      required: true,
    },
    hours: {
      type: [hoursSchema],
    },
    stripeAccountId: {
      type: String,
    },
    isConnectedAccountReady: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    about: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const Store = model<IStore, StoreModel>('Store', storeSchema);
