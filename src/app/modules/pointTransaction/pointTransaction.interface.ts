import { Model, Types } from 'mongoose';
import { POINT_TRANSACTION_TYPE } from './pointTransaction.constants';

export type IPointTransaction = {
  user: Types.ObjectId;
  pointsChange: number;
  type: POINT_TRANSACTION_TYPE;
  balanceAfter: number;
  transactionId: string;
  relatedOrderId?: Types.ObjectId;
};

export type PointTransactionModel = Model<IPointTransaction>;
