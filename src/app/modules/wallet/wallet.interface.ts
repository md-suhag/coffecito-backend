import { Model, Types } from 'mongoose';

export type IWallet = {
  user: Types.ObjectId;
  balance: number;
};

export type WalletModel = Model<IWallet>;
