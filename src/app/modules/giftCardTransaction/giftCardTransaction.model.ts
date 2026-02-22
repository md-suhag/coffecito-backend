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
  },
  {
    timestamps: true,
  },
);

export const GiftCardTransaction = model<
  IGiftCardTransaction,
  GiftCardTransactionModel
>('GiftCardTransaction', giftCardTransactionSchema);
