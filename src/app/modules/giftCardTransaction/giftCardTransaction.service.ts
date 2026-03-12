import { JwtPayload } from 'jsonwebtoken';
import QueryBuilder from '../../builder/QueryBuilder';
import { GiftCardTransaction } from './giftCardTransaction.model';

const getMyGiftCardTransactionsFromDB = async (
  user: JwtPayload,
  query: Record<string, unknown>,
) => {
  const transactionQuery = new QueryBuilder(
    GiftCardTransaction.find({ user: user.id })
      .populate({
        path: 'giftCard',
      })
      .populate({
        path: 'relatedOrder',
        select: 'orderId store',
        populate: {
          path: 'store',
          select: 'name',
        },
      })
      .sort('-createdAt'),
    query,
  )
    .filter()
    .sort()
    .paginate();

  const [transactions, meta] = await Promise.all([
    transactionQuery.modelQuery,
    transactionQuery.getPaginationInfo(),
  ]);

  return {
    transactions,
    meta,
  };
};

export const GiftCardTransactionServices = {
  getMyGiftCardTransactionsFromDB,
};