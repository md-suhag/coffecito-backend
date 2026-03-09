import { Schema, model } from 'mongoose';
import { IGiftCard, GiftCardModel } from './giftCard.interface';
import { GIFT_CARD_STATUS } from './giftCard.constants';

const giftCardSchema = new Schema<IGiftCard, GiftCardModel>(
  {
    cardNumber: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currentBalance: {
      type: Number,
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverEmail: {
      type: String,
      required: true,
    },
    receiverName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: false,
    },

    status: {
      type: String,
      enum: Object.values(GIFT_CARD_STATUS),
      default: GIFT_CARD_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  },
);

export const GiftCard = model<IGiftCard, GiftCardModel>(
  'GiftCard',
  giftCardSchema,
);
