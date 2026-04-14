import { Types } from 'mongoose';
import {
  STORE_TRANSACTION_TYPE,
  STORE_TRANSACTION_STATUS,
} from './storeTransaction.constants';

export type IStoreTransaction = {
  store: Types.ObjectId;
  storeWallet: Types.ObjectId;
  order?: Types.ObjectId;
  type: STORE_TRANSACTION_TYPE;
  grossAmount: number;
  stripeFee: number;
  netAmount: number;
  balanceAfter: number;
  paymentMethod: string;
  status: STORE_TRANSACTION_STATUS;
  transactionId: string;
  note?: string;
};
