import { Schema, model } from 'mongoose';
import {
  IPointTransaction,
  PointTransactionModel,
} from './pointTransaction.interface';
import { POINT_TRANSACTION_TYPE } from './pointTransaction.constants';

const pointTransactionSchema = new Schema<
  IPointTransaction,
  PointTransactionModel
>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pointsChange: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: POINT_TRANSACTION_TYPE,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    relatedOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
  },
  {
    timestamps: true,
  },
);

export const PointTransaction = model<IPointTransaction, PointTransactionModel>(
  'PointTransaction',
  pointTransactionSchema,
);
