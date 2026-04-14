import { Schema, model } from 'mongoose';
import { IStoreTransaction } from './storeTransaction.interface';
import {
  STORE_TRANSACTION_TYPE,
  STORE_TRANSACTION_STATUS,
} from './storeTransaction.constants';

const storeTransactionSchema = new Schema<IStoreTransaction>(
  {
    store: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    storeWallet: {
      type: Schema.Types.ObjectId,
      ref: 'StoreWallet',
      required: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    type: {
      type: String,
      enum: Object.values(STORE_TRANSACTION_TYPE),
      required: true,
    },
    grossAmount: {
      type: Number,
      required: true,
    },
    stripeFee: {
      type: Number,
      required: true,
      default: 0,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(STORE_TRANSACTION_STATUS),
      default: STORE_TRANSACTION_STATUS.COMPLETED,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    note: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const StoreTransaction = model<IStoreTransaction>(
  'StoreTransaction',
  storeTransactionSchema,
);
