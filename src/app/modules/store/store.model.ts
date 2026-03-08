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
    image: {
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
    about: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Filter out deleted stores for find queries
storeSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

storeSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

storeSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

export const Store = model<IStore, StoreModel>('Store', storeSchema);
