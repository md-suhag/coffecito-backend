import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import ApiError from '../../../errors/ApiError';
import { StoreWallet } from './storeWallet.model';
import { StoreTransaction } from '../storeTransaction/storeTransaction.model';
import { processStorePayout } from '../../../util/storeWalletHelper';

const getAllStoreWalletsFromDB = async (query: Record<string, unknown>) => {
  const walletsQuery = new QueryBuilder(
    StoreWallet.find().populate('store', 'name image address'),
    query,
  )
    .filter()
    .sort()
    .paginate();

  const [wallets, meta] = await Promise.all([
    walletsQuery.modelQuery.lean(),
    walletsQuery.getPaginationInfo(),
  ]);

  return { wallets, meta };
};

const getStoreWalletByStoreIdFromDB = async (storeId: string) => {
  const wallet = await StoreWallet.findOne({ store: storeId })
    .populate('store', 'name image address')
    .lean();

  if (!wallet) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Store wallet not found');
  }

  return wallet;
};

const getStoreTransactionsFromDB = async (
  storeId: string,
  query: Record<string, unknown>,
) => {
  const transactionsQuery = new QueryBuilder(
    StoreTransaction.find({ store: storeId })
      .populate('order', 'orderId totalAmount')
      .sort({ createdAt: -1 }),
    query,
  )
    .filter()
    .paginate();

  const [transactions, meta] = await Promise.all([
    transactionsQuery.modelQuery.lean(),
    transactionsQuery.getPaginationInfo(),
  ]);

  return { transactions, meta };
};

const processPayoutFromDB = async (
  storeId: string,
  amount: number,
  note?: string,
) => {
  const result = await processStorePayout(storeId, amount, note);
  return result;
};

export const StoreWalletServices = {
  getAllStoreWalletsFromDB,
  getStoreWalletByStoreIdFromDB,
  getStoreTransactionsFromDB,
  processPayoutFromDB,
};
