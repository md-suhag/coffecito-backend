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
import { GiftCard } from '../app/modules/giftCard/giftCard.model';
import { GIFT_CARD_STATUS } from '../app/modules/giftCard/giftCard.constants';
import { emailHelper } from '../helpers/emailHelper';
import { GiftCardTransaction } from '../app/modules/giftCardTransaction/giftCardTransaction.model';
import {
  GIFT_CARD_TRANSACTION_STATUS,
  GIFT_CARD_TRANSACTION_TYPE,
} from '../app/modules/giftCardTransaction/giftCardTransaction.constants';
import { emailTemplate } from '../shared/emailTemplate';

export const handlePaymentIntentSucceeded = async (event: Stripe.Event) => {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  if (
    !['wallet_topup', 'gift_card'].includes(
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
    }
  });
};
