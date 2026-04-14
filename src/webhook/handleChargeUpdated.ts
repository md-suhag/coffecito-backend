import Stripe from 'stripe';
import stripe from '../config/stripe';
import { Order } from '../app/modules/order/order.model';
import { withStripeIdempotency } from '../util/withStripeIdempotency';
import { recordStoreEarning } from '../util/storeWalletHelper';

export const handleChargeUpdated = async (event: Stripe.Event) => {
  const charge = event.data.object as Stripe.Charge;

  // We only care about succeeded charges that are part of an order payment
  if (charge.status !== 'succeeded') return;

  const paymentIntentId =
    typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : charge.payment_intent?.id;
  if (!paymentIntentId) return;

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (paymentIntent.metadata?.type !== 'order_payment') return;

  const orderIds = JSON.parse(paymentIntent.metadata?.orderIds || '[]');
  const storeBreakdown = JSON.parse(
    paymentIntent.metadata?.storeBreakdown || '[]',
  );

  if (orderIds.length === 0 || storeBreakdown.length === 0) return;

  await withStripeIdempotency(event, async session => {
    // 1. Get Actual Fee from Balance Transaction
    let totalFee = 0;
    if (charge.balance_transaction) {
      const bt = await stripe.balanceTransactions.retrieve(
        charge.balance_transaction as string,
      );
      totalFee = bt.fee / 100; // Stripe fee in USD
    }

    const feePerStore =
      Math.round((totalFee / storeBreakdown.length) * 100) / 100;

    // 2. Record earnings in Store Wallet (no direct transfer)
    for (const item of storeBreakdown) {
      if (item.amount > 0) {
        const relatedOrder = await Order.findOne({
          _id: { $in: orderIds },
          store: item.storeId,
        }).session(session);

        // Skip if already processed
        if (
          !relatedOrder ||
          (relatedOrder.stripeFee && relatedOrder.stripeFee > 0)
        ) {
          continue;
        }

        try {
          // Record earning in the store wallet ledger
          await recordStoreEarning(
            item.storeId,
            relatedOrder._id.toString(),
            item.amount,
            feePerStore, // Actual Stripe fee
            'STRIPE',
            session,
          );

          // Mark order with fee to indicate it's processed
          relatedOrder.stripeFee = feePerStore;
          await relatedOrder.save({ session });
        } catch (error) {
          console.error(
            `Failed to record earning for store ${item.storeId}:`,
            error,
          );
        }
      }
    }
  });
};
