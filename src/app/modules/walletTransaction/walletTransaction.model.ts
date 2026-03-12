import { Schema, model } from 'mongoose';
import {
  IWalletTransaction,
  WalletTransactionModel,
} from './walletTransaction.interface';
import {
  WALLET_TRANSACTION_STATUS,
  WALLET_TRANSACTION_TYPE,
} from './walletTransaction.constants';

const walletTransactionSchema = new Schema<
  IWalletTransaction,
  WalletTransactionModel
>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    wallet: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },
    type: {
      type: String,
      enum: WALLET_TRANSACTION_TYPE,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    paymentGatewayData: {
      type: Object,
    },
    status: {
      type: String,
      enum: WALLET_TRANSACTION_STATUS,
      default: WALLET_TRANSACTION_STATUS.PENDING,
    },
    title: {
      type: String,
      required: true,
    },
    remark: {
      type: String,
    },
    relatedOrder: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
  },
  {
    timestamps: true,
  },
);

export const WalletTransaction = model<
  IWalletTransaction,
  WalletTransactionModel
>('WalletTransaction', walletTransactionSchema);
