import { Model, Types } from 'mongoose';
import { GIFT_CARD_STATUS } from './giftCard.constants';

export type IGiftCard = {
  cardNumber: string;
  amount: number;
  currentBalance: number;
  sender: Types.ObjectId;
  receiverEmail: string;
  receiverName: string;
  message?: string;
  isPaid: boolean;
  status: GIFT_CARD_STATUS;
};

export type GiftCardModel = Model<IGiftCard>;
