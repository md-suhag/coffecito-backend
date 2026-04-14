import { Schema, model, Types } from 'mongoose';
import { IStoreWallet } from './storeWallet.interface';

const storeWalletSchema = new Schema<IStoreWallet>(
  {
    store: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalEarned: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalWithdrawn: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const StoreWallet = model<IStoreWallet>('StoreWallet', storeWalletSchema);
