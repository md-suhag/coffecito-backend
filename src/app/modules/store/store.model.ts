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
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    timezone: {
      type: String,
    },
    about: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Map latitude and longitude to timezone before saving
storeSchema.pre('save', async function (next) {
  if (this.isModified('location')) {
    try {
      const { find } = await import('geo-tz');
      const [lng, lat] = this.location.coordinates;
      const tzs = find(lat, lng);
      if (tzs && tzs.length > 0) {
        this.timezone = tzs[0];
      }
    } catch (error) {
      console.error('Error finding timezone for coordinates:', error);
    }
  }
  next();
});

// Map latitude and longitude to timezone before updating
storeSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as any;

  // Check if location is being updated (flat or via $set)
  let location = update.location;
  if (!location && update.$set) {
    location = update.$set.location;
  }

  if (location && location.coordinates) {
    try {
      const { find } = await import('geo-tz');
      const [lng, lat] = location.coordinates;
      const tzs = find(lat, lng);
      if (tzs && tzs.length > 0) {
        if (update.$set) {
          update.$set.timezone = tzs[0];
        } else {
          update.timezone = tzs[0];
        }
      }
    } catch (error) {
      console.error('Error finding timezone during update:', error);
    }
  }
  next();
});

storeSchema.index({ location: '2dsphere' });

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
