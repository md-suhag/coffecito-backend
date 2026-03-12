// import mongoose from 'mongoose';
// import Stripe from 'stripe';
// import { Customer } from '../app/modules/customer/customer.model';
// import { Wallet } from '../app/modules/wallet/wallet.model';
// import { WalletTransaction } from '../app/modules/walletTransaction/walletTransaction.model';
// import {
//   WALLET_TRANSACTION_STATUS,
//   WALLET_TRANSACTION_TYPE,
// } from '../app/modules/walletTransaction/walletTransaction.constants';
// import { StripeEvent } from '../app/modules/stripeEvent/stripeEvent.model';

// export const handleCheckoutSessionCompleted = async (event: Stripe.Event) => {
//   const session = event.data.object as Stripe.Checkout.Session;

//   const type = session.metadata?.type;
//   if (type === 'wallet_topup') {
//     const userId = session.metadata?.userId;
//     const amount = session.metadata?.amount;

//     if (!userId || !amount) return;

//     await Wallet.updateOne(
//       { user: userId },
//       { $inc: { balance: Number(amount) } },
//       { upsert: true, runValidators: true },
//     );
//     const wallet = await Wallet.findOne({ user: userId });
//     await WalletTransaction.create({
//       user: userId,
//       amount: Number(amount),
//       type: WALLET_TRANSACTION_TYPE.DEPOSIT,
//       paymentGatewayData: session,
//       status: WALLET_TRANSACTION_STATUS.SUCCESS,
//       balanceAfter: (wallet?.balance || 0) + Number(amount),
//       wallet: wallet?._id,
//     });

//     await StripeEvent.updateOne(
//       { eventId: event.id },
//       { isProcessed: true, processedAt: new Date() },
//     );
//     return;
//   }
// };
