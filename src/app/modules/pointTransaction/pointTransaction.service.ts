import { ClientSession } from 'mongoose';
import { Customer } from '../customer/customer.model';
import { IPointTransaction } from './pointTransaction.interface';
import { PointTransaction } from './pointTransaction.model';
import { EARN_POINT_RATE } from '../order/order.constants';
import { POINT_TRANSACTION_TYPE } from './pointTransaction.constants';
import QueryBuilder from '../../builder/QueryBuilder';
import { Order } from '../order/order.model';

const earnPoints = async (
  userId: string,
  amountSpent: number,
  orderId: string,
  session?: ClientSession,
) => {
  const pointsToEarn = Math.floor(amountSpent / EARN_POINT_RATE);
  if (pointsToEarn <= 0) return null;

  const customer = await Customer.findOne({ user: userId }).session(
    session as any,
  );
  if (!customer) return null;

  customer.loyaltyPoints += pointsToEarn;
  await customer.save({ session });

  // Update pointsEarned in Order
  await Order.findByIdAndUpdate(
    orderId,
    { pointsEarned: pointsToEarn },
    { session },
  );

  const transactionData: Partial<IPointTransaction> = {
    user: userId as any,
    pointsChange: pointsToEarn,
    type: POINT_TRANSACTION_TYPE.EARN,
    balanceAfter: customer.loyaltyPoints,
    relatedOrderId: orderId as any,
  };

  const result = await PointTransaction.create([transactionData], { session });
  return result[0];
};

const createTransaction = async (
  payload: Partial<IPointTransaction>,
  session?: ClientSession,
) => {
  const result = await PointTransaction.create([payload], { session });
  return result[0];
};

const getMyPointTransactionsFromDB = async (
  userId: string,
  query: Record<string, any>,
) => {
  const pointTransactionQuery = new QueryBuilder(
    PointTransaction.find({ user: userId }).populate({
      path: 'relatedOrderId',
      select: 'orderId totalAmount createdAt',
      populate: {
        path: 'store',
        select: 'name image address',
      },
    }),
    query,
  )
    .sort()
    .paginate()
    .filter();

  const [result, meta] = await Promise.all([
    pointTransactionQuery.modelQuery,
    pointTransactionQuery.getPaginationInfo(),
  ]);

  return { result, meta };
};

export const PointTransactionServices = {
  earnPoints,
  createTransaction,
  getMyPointTransactionsFromDB,
};
