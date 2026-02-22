import { Model, Types } from 'mongoose';
import {
  GIFT_CARD_TRANSACTION_STATUS,
  GIFT_CARD_TRANSACTION_TYPE,
} from './giftCardTransaction.constants';

export type IGiftCardTransaction = {
  giftCard: Types.ObjectId;
  type: GIFT_CARD_TRANSACTION_TYPE;
  amount: number;
  balanceAfter: number;
  status: GIFT_CARD_TRANSACTION_STATUS;
};

export type GiftCardTransactionModel = Model<IGiftCardTransaction>;
