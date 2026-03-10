import Stripe from 'stripe';
import stripe from '../config/stripe';
import { Order } from '../app/modules/order/order.model';
import { withStripeIdempotency } from '../util/withStripeIdempotency';

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
    // 1. Get Fee from Balance Transaction
    let totalFee = 0;
    if (charge.balance_transaction) {
      const bt = await stripe.balanceTransactions.retrieve(
        charge.balance_transaction as string,
      );
      totalFee = bt.fee / 100; // Stripe fee in USD
    }

    const feePerStore = totalFee / storeBreakdown.length;

    // 2. Process Transfers
    for (const item of storeBreakdown) {
      if (item.stripeAccountId && item.amount > 0) {
        // Find the specific order for this store
        const relatedOrder = await Order.findOne({
          _id: { $in: orderIds },
          store: item.storeId,
        }).session(session);

        // Check if transfer already handled (if stripeFee > 0 or another flag)
        if (
          !relatedOrder ||
          (relatedOrder.stripeFee && relatedOrder.stripeFee > 0)
        ) {
          continue;
        }

        const transferAmount = Math.max(0, item.amount - feePerStore);

        try {
          // Check if transfer already exists for this order/charge to avoid duplicates
          // Stripe idempotency handles this if we use a consistent key, but let's be safe.

          await stripe.transfers.create(
            {
              amount: Math.round(transferAmount * 100),
              currency: 'usd',
              destination: item.stripeAccountId,
              source_transaction: charge.id,
              transfer_group: orderIds[0], // Using first Order ID as group
              metadata: {
                paymentIntentId: paymentIntent.id,
                chargeId: charge.id,
                storeId: item.storeId,
                originalAmount: item.amount,
                deductedFee: feePerStore,
              },
            },
            {
              idempotencyKey: `transfer-${charge.id}-${item.storeId}`,
            },
          );

          // 3. Update Order with Fee to mark as processed
          relatedOrder.stripeFee = feePerStore;
          await relatedOrder.save({ session });
        } catch (transferError) {
          console.error(
            `Failed to transfer to store ${item.storeId}:`,
            transferError,
          );
        }
      }
    }
  });
};
