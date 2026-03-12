import { Model, Types } from 'mongoose';
import {
  GIFT_CARD_TRANSACTION_STATUS,
  GIFT_CARD_TRANSACTION_TYPE,
} from './giftCardTransaction.constants';

export type IGiftCardTransaction = {
  user: Types.ObjectId;
  giftCard: Types.ObjectId;
  type: GIFT_CARD_TRANSACTION_TYPE;
  amount: number;
  balanceAfter: number;
  status: GIFT_CARD_TRANSACTION_STATUS;
  relatedOrder?: Types.ObjectId;
};

export type GiftCardTransactionModel = Model<IGiftCardTransaction>;
