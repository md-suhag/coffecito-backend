import { JwtPayload } from 'jsonwebtoken';
import QueryBuilder from '../../builder/QueryBuilder';
import { WalletTransaction } from './walletTransaction.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { User } from '../user/user.model';
import { calculateDistanceKm } from '../../../util/calculateDistance';

const getMyWalletTransactionsFromDB = async (
  user: JwtPayload,
  query: Record<string, unknown>,
) => {
  const transactionQuery = new QueryBuilder(
    WalletTransaction.find({ user: user.id })
      .populate({
        path: 'relatedOrder',
        select: 'items store',
        populate: {
          path: 'items.product',
          select: 'image',
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

  const formattedTransactions = transactions.map(tx => {
    let image = null;
    if (tx.relatedOrder) {
      const firstItem = (tx.relatedOrder as any).items[0];
      image = firstItem?.product?.image;
    }

    return {
      _id: tx._id,
      title: tx.title,
      type: tx.type,
      amount: tx.amount,
      status: tx.status,
      createdAt: tx.createdAt,
      image,
    };
  });

  return {
    transactions: formattedTransactions,
    meta,
  };
};

const getTransactionDetailsFromDB = async (user: JwtPayload, id: string) => {
  const transaction = await WalletTransaction.findOne({
    _id: id,
    user: user.id,
  }).populate({
    path: 'relatedOrder',
    populate: [
      {
        path: 'store',
        select: 'name location',
      },
      {
        path: 'items.product',
        select: 'name image',
      },
    ],
  });

  if (!transaction) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Transaction not found');
  }

  let distanceKm: number | null = null;
  let items = [];

  if (transaction.relatedOrder) {
    const order = transaction.relatedOrder as any;
    const currentUser = await User.findById(user.id).select('location');

    if (
      currentUser?.location?.latitude &&
      currentUser?.location?.longitude &&
      order.store?.location?.coordinates
    ) {
      const [lng, lat] = order.store.location.coordinates;
      distanceKm = calculateDistanceKm(
        currentUser.location.latitude,
        currentUser.location.longitude,
        lat,
        lng,
      );
    }

    items = order.items.map((item: any) => ({
      name: item.productName || item.product?.name,
      quantity: item.quantity,
      price: item.itemTotalPrice,
    }));
  }

  return {
    _id: transaction._id,
    title: transaction.title,
    type: transaction.type,
    amount: transaction.amount,
    status: transaction.status,
    createdAt: transaction.createdAt,
    balanceAfter: transaction.balanceAfter,
    previousBalance:
      transaction.balanceAfter +
      (transaction.type === 'spend' ? transaction.amount : -transaction.amount),
    relatedOrder: transaction.relatedOrder
      ? {
          _id: (transaction.relatedOrder as any)._id,
          orderId: (transaction.relatedOrder as any).orderId,
          storeName: (transaction.relatedOrder as any).store?.name,
          distanceKm: distanceKm ? Number(distanceKm.toFixed(1)) : null,
          items,
        }
      : null,
  };
};

export const WalletTransactionServices = {
  getMyWalletTransactionsFromDB,
  getTransactionDetailsFromDB,
};