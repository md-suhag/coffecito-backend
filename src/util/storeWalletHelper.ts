import mongoose from 'mongoose';
import { StoreWallet } from '../app/modules/storeWallet/storeWallet.model';
import { StoreTransaction } from '../app/modules/storeTransaction/storeTransaction.model';
import {
  STORE_TRANSACTION_TYPE,
  STORE_TRANSACTION_STATUS,
} from '../app/modules/storeTransaction/storeTransaction.constants';
import { generateSecureId } from './generateId';
import stripe from '../config/stripe';
import { Store } from '../app/modules/store/store.model';

const STRIPE_FEE_PERCENT = 0.029;
const STRIPE_FEE_FIXED = 0.30;

/**
 * Calculate estimated Stripe fee for wallet/giftcard payments
 */
export const calculateEstimatedStripeFee = (amount: number): number => {
  return Math.round((amount * STRIPE_FEE_PERCENT + STRIPE_FEE_FIXED) * 100) / 100;
};

/**
 * Record an earning entry in the store's wallet and transaction ledger.
 */
export const recordStoreEarning = async (
  storeId: string,
  orderId: string,
  grossAmount: number,
  stripeFee: number,
  paymentMethod: string,
  session?: mongoose.ClientSession,
) => {
  const netAmount = Math.round((grossAmount - stripeFee) * 100) / 100;

  // Find or create the store wallet
  let storeWallet = await StoreWallet.findOne({ store: storeId }).session(
    session || null,
  );

  if (!storeWallet) {
    const created = await StoreWallet.create(
      [{ store: storeId, balance: 0, totalEarned: 0, totalWithdrawn: 0 }],
      { session: session || undefined },
    );
    storeWallet = created[0];
  }

  // Update wallet balance
  storeWallet.balance = Math.round((storeWallet.balance + netAmount) * 100) / 100;
  storeWallet.totalEarned =
    Math.round((storeWallet.totalEarned + netAmount) * 100) / 100;
  await storeWallet.save({ session: session || undefined });

  // Create transaction record
  const transactionId = await generateSecureId(
    'STXN-',
    StoreTransaction,
    'transactionId',
  );

  await StoreTransaction.create(
    [
      {
        store: storeId,
        storeWallet: storeWallet._id,
        order: orderId,
        type: STORE_TRANSACTION_TYPE.EARNING,
        grossAmount,
        stripeFee,
        netAmount,
        balanceAfter: storeWallet.balance,
        paymentMethod,
        status: STORE_TRANSACTION_STATUS.COMPLETED,
        transactionId,
      },
    ],
    { session: session || undefined },
  );

  return { netAmount, balanceAfter: storeWallet.balance };
};

/**
 * Process a payout for a store wallet.
 * 1. Checks Stripe available balance
 * 2. Transfers to store's connected Stripe account
 * 3. Deducts from StoreWallet balance
 */
export const processStorePayout = async (
  storeId: string,
  amount: number,
  note?: string,
) => {
  // 1. Validate store wallet balance
  const storeWallet = await StoreWallet.findOne({ store: storeId });
  if (!storeWallet) {
    throw new Error('Store wallet not found');
  }
  if (storeWallet.balance < amount) {
    throw new Error('Insufficient store wallet balance');
  }

  // 2. Get store's Stripe connected account ID
  const store = await Store.findById(storeId);
  if (!store || !store.stripeAccountId) {
    throw new Error('Store does not have a connected Stripe account');
  }

  // 3. Check Stripe available balance
  const balance = await stripe.balance.retrieve();
  const availableUSD = balance.available.find(b => b.currency === 'usd');
  const availableAmount = availableUSD ? availableUSD.amount / 100 : 0;

  if (availableAmount < amount) {
    throw new Error(
      `Insufficient Stripe available balance. Available: $${availableAmount.toFixed(2)}, Required: $${amount.toFixed(2)}`,
    );
  }

  // 4. Generate transaction ID first (used as idempotency key for Stripe)
  const transactionId = await generateSecureId(
    'STXN-',
    StoreTransaction,
    'transactionId',
  );

  // 5. Transfer to connected account
  const transferAmountInCents = Math.round(amount * 100);

  const transfer = await stripe.transfers.create(
    {
      amount: transferAmountInCents,
      currency: 'usd',
      destination: store.stripeAccountId,
      metadata: {
        storeId,
        type: 'manual_payout',
        transactionId,
        note: note || '',
      },
    },
    { idempotencyKey: `payout-${transactionId}` },
  );

  // 6. Update store wallet balance
  storeWallet.balance = Math.round((storeWallet.balance - amount) * 100) / 100;
  storeWallet.totalWithdrawn =
    Math.round((storeWallet.totalWithdrawn + amount) * 100) / 100;
  await storeWallet.save();

  // 7. Record payout transaction
  await StoreTransaction.create([
    {
      store: storeId,
      storeWallet: storeWallet._id,
      type: STORE_TRANSACTION_TYPE.PAYOUT,
      grossAmount: amount,
      stripeFee: 0,
      netAmount: amount,
      balanceAfter: storeWallet.balance,
      paymentMethod: 'STRIPE_TRANSFER',
      status: STORE_TRANSACTION_STATUS.COMPLETED,
      transactionId,
      note: note || `Stripe Transfer: ${transfer.id}`,
    },
  ]);

  return {
    newBalance: storeWallet.balance,
    stripeTransferId: transfer.id,
  };
};
