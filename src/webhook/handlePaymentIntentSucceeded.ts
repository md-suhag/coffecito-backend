import mongoose from 'mongoose';
import Stripe from 'stripe';
import { Wallet } from '../app/modules/wallet/wallet.model';
import { WalletTransaction } from '../app/modules/walletTransaction/walletTransaction.model';
import { StripeEvent } from '../app/modules/stripeEvent/stripeEvent.model';
import { Customer } from '../app/modules/customer/customer.model';
import {
  WALLET_TRANSACTION_STATUS,
  WALLET_TRANSACTION_TYPE,
} from '../app/modules/walletTransaction/walletTransaction.constants';
import { withStripeIdempotency } from '../util/withStripeIdempotency';
import { GiftCard } from '../app/modules/giftCard/giftCard.model';
import { GIFT_CARD_STATUS } from '../app/modules/giftCard/giftCard.constants';
import { emailHelper } from '../helpers/emailHelper';
import { GiftCardTransaction } from '../app/modules/giftCardTransaction/giftCardTransaction.model';
import {
  GIFT_CARD_TRANSACTION_STATUS,
  GIFT_CARD_TRANSACTION_TYPE,
} from '../app/modules/giftCardTransaction/giftCardTransaction.constants';
import { emailTemplate } from '../shared/emailTemplate';
import stripe from '../config/stripe';
import { Order } from '../app/modules/order/order.model';
import { Cart } from '../app/modules/cart/cart.model';
import {
  PAYMENT_STATUS,
  ORDER_STATUS,
} from '../app/modules/order/order.constants';
import { Payment } from '../app/modules/payment/payment.model';
import { NotificationHelper } from '../helpers/notificationHelper';
import { NOTIFICATION_TYPE } from '../app/modules/notification/notification.interface';

export const handlePaymentIntentSucceeded = async (event: Stripe.Event) => {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  if (
    !['wallet_topup', 'gift_card', 'order_payment'].includes(
      paymentIntent.metadata?.type as string,
    )
  )
    return;

  const userId = paymentIntent.metadata?.userId;
  const amount = paymentIntent.amount / 100;
  if (!userId || !amount) return;

  await withStripeIdempotency(event, async session => {
    if (paymentIntent.metadata?.type === 'wallet_topup') {
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
            title: 'Add Money',
          },
        ],
        { session },
      );
    } else if (paymentIntent.metadata?.type === 'gift_card') {
      const giftCardId = paymentIntent.metadata?.giftCardId;
      const senderEmail = paymentIntent.metadata?.senderEmail;
      if (!giftCardId) return;

      const giftCard = await GiftCard.findByIdAndUpdate(
        giftCardId,
        {
          amount: amount,
          currentBalance: amount,
          status: GIFT_CARD_STATUS.ACTIVE,
        },
        { new: true, session },
      );

      if (giftCard) {
        await GiftCardTransaction.create(
          [
            {
              user: userId,
              giftCard: giftCard._id,
              type: GIFT_CARD_TRANSACTION_TYPE.PURCHASE,
              amount: amount,
              balanceAfter: amount,
              status: GIFT_CARD_TRANSACTION_STATUS.SUCCESS,
            },
          ],
          { session },
        );

        if (giftCard.receiverEmail) {
          const values = {
            email: giftCard.receiverEmail,
            name: giftCard.receiverName,
            amount: giftCard.amount,
            cardNumber: giftCard.cardNumber,
            message: giftCard.message,
            senderEmail: senderEmail,
          };
          const template = emailTemplate.sendGiftCard(values);
          await emailHelper.sendEmail(template);
        }
      }
    } else if (paymentIntent.metadata?.type === 'order_payment') {
      const orderIds = JSON.parse(paymentIntent.metadata?.orderIds || '[]');
      const storeBreakdown = JSON.parse(
        paymentIntent.metadata?.storeBreakdown || '[]',
      );

      // 1. Update Orders
      await Order.updateMany(
        { _id: { $in: orderIds } },
        {
          paymentStatus: PAYMENT_STATUS.PAID,
          orderStatus: ORDER_STATUS.PENDING,
          paymentId: paymentIntent.id,
        },
        { session },
      );

      // 2. Log Payments (without transferring here)
      for (const item of storeBreakdown) {
        // Find the specific order for this store to link in Payment model
        const relatedOrder = await Order.findOne({
          _id: { $in: orderIds },
          store: item.storeId,
        }).session(session);

        if (relatedOrder) {
          await Payment.create(
            [
              {
                order: relatedOrder._id,
                status: 'COMPLETED',
                amount: item.amount,
                eventId: event.id,
                paymentGatewayData: paymentIntent,
              },
            ],
            { session },
          );
        }
      }

      // 3. Clear Cart
      await Cart.deleteOne({ user: userId }).session(session);

      // 4. Update last order in customer profile
      await Customer.findOneAndUpdate(
        { user: userId },
        { lastOrder: orderIds[0] },
        { session },
      );

      // Trigger Notification
      NotificationHelper.sendAndSaveNotification({
        receiver: userId,
        title: 'Order Placed Successfully! ☕',
        message: `Your payment was successful and your order is being processed.`,
        type: NOTIFICATION_TYPE.ORDER,
        data: { orderIds: JSON.stringify(orderIds) },
      });
    }
  });
};
