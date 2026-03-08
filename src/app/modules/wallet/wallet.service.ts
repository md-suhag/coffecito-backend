import { JwtPayload } from 'jsonwebtoken';
import { IWallet } from './wallet.interface';
import stripe from '../../../config/stripe';
import config from '../../../config';
import { Wallet } from './wallet.model';

const addMoneyIntoWallet = async (amount: number, user: JwtPayload) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Wallet Topup',
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: user.id,
      amount,
      type: 'wallet_topup',
    },
    payment_intent_data: {
      metadata: {
        type: 'wallet_topup',
        userId: user.id,
        amount,
      },
    },
    mode: 'payment',
    success_url: `${config.website_url}/wallet?payment=success`,
    cancel_url: `${config.website_url}/wallet?payment=cancel`,
  });

  return { checkoutUrl: session.url };
};

const getMyWallet = async (user: JwtPayload) => {
  const wallet = await Wallet.findOne({ user: user.id })
    .select('balance')
    .lean();
  return wallet;
};

export const WalletServices = {
  addMoneyIntoWallet,
  getMyWallet,
};
