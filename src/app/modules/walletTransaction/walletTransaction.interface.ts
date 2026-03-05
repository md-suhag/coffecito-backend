import { Model, Types } from 'mongoose';
import {
  WALLET_TRANSACTION_STATUS,
  WALLET_TRANSACTION_TYPE,
} from './walletTransaction.constants';

export type IWalletTransaction = {
  user: Types.ObjectId;
  wallet: Types.ObjectId;
  type: WALLET_TRANSACTION_TYPE;
  amount: number;
  balanceAfter: number;
  paymentGatewayData: Record<string, any>;
  status: WALLET_TRANSACTION_STATUS;
};

export type WalletTransactionModel = Model<IWalletTransaction>;
