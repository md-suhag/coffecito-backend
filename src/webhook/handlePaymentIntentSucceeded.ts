import mongoose from 'mongoose';
import Stripe from 'stripe';
import { Wallet } from '../app/modules/wallet/wallet.model';
import { WalletTransaction } from '../app/modules/walletTransaction/walletTransaction.model';
import { StripeEvent } from '../app/modules/stripeEvent/stripeEvent.model';
import {
  WALLET_TRANSACTION_STATUS,
  WALLET_TRANSACTION_TYPE,
} from '../app/modules/walletTransaction/walletTransaction.constants';
import { withStripeIdempotency } from '../util/withStripeIdempotency';

export const handlePaymentIntentSucceeded = async (event: Stripe.Event) => {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  if (paymentIntent.metadata?.type !== 'wallet_topup') return;

  const userId = paymentIntent.metadata?.userId;
  const amount = paymentIntent.amount / 100;
  if (!userId || !amount) return;

  await withStripeIdempotency(event, async session => {
    const wallet = await Wallet.findOneAndUpdate(
      { user: userId },
      { $inc: { balance: amount } },
      { upsert: true, new: true, runValidators: true, session },
    );

    await WalletTransaction.create(
      [
        {
          user: userId,
          amount,
          type: WALLET_TRANSACTION_TYPE.DEPOSIT,
          paymentGatewayData: paymentIntent,
          status: WALLET_TRANSACTION_STATUS.SUCCESS,
          balanceAfter: wallet.balance,
          wallet: wallet._id,
        },
      ],
      { session },
    );
  });
};
