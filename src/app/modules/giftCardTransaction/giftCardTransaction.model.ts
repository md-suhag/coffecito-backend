import { Schema, model } from 'mongoose';
import {
  IGiftCardTransaction,
  GiftCardTransactionModel,
} from './giftCardTransaction.interface';
import {
  GIFT_CARD_TRANSACTION_STATUS,
  GIFT_CARD_TRANSACTION_TYPE,
} from './giftCardTransaction.constants';

const giftCardTransactionSchema = new Schema<
  IGiftCardTransaction,
  GiftCardTransactionModel
>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    giftCard: {
      type: Schema.Types.ObjectId,
      ref: 'GiftCard',
      required: true,
    },
    type: {
      type: String,
      enum: GIFT_CARD_TRANSACTION_TYPE,
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
    status: {
      type: String,
      enum: GIFT_CARD_TRANSACTION_STATUS,
      default: GIFT_CARD_TRANSACTION_STATUS.PENDING,
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

export const GiftCardTransaction = model<
  IGiftCardTransaction,
  GiftCardTransactionModel
>('GiftCardTransaction', giftCardTransactionSchema);
