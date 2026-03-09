import { JwtPayload } from 'jsonwebtoken';
import { GiftCard } from './giftCard.model';
import stripe from '../../../config/stripe';
import config from '../../../config';
import { generateUniqueCardNumber } from '../../../util/generateGiftcardNumber';

const createGiftCard = async (payload: any, user: JwtPayload) => {
  const { amount, receiverEmail, receiverName, message } = payload;

  const cardNumber = await generateUniqueCardNumber();

  const giftCard = await GiftCard.create({
    cardNumber,
    amount: 0,
    currentBalance: 0,
    sender: user.id,
    receiverEmail,
    receiverName,
    message,
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],

    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Gift Card',
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: user.id,
      type: 'gift_card',
      giftCardId: giftCard._id.toString(),
      senderEmail: user.email,
    },
    payment_intent_data: {
      metadata: {
        userId: user.id,
        type: 'gift_card',
        giftCardId: giftCard._id.toString(),
        senderEmail: user.email,
      },
    },
    mode: 'payment',
    success_url: `${config.website_url}/gift-card?payment=success`,
    cancel_url: `${config.website_url}/gift-card?payment=cancel`,
  });

  return { checkoutUrl: session.url };
};

export const GiftCardServices = {
  createGiftCard,
};
