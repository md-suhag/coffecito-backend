import { Types } from 'mongoose';

export type IStoreWallet = {
  store: Types.ObjectId;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
};
