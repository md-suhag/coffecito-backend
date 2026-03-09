import { JwtPayload } from 'jsonwebtoken';
import { GiftCard } from './giftCard.model';
import stripe from '../../../config/stripe';
import config from '../../../config';
import mongoose from 'mongoose';
import { generateUniqueCardNumber } from '../../../util/generateGiftcardNumber';
import { Customer } from '../customer/customer.model';
import { GIFT_CARD_STATUS } from './giftCard.constants';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
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

const addGiftCard = async (
  payload: { cardNumber: string },
  user: JwtPayload,
) => {
  const { cardNumber } = payload;

  // 1. Find the gift card
  const giftCard = await GiftCard.findOne({ cardNumber });

  if (!giftCard) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Gift Card Number');
  }
  if (giftCard.receiverEmail !== user.email) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Gift Card Number');
  }

  if (giftCard.status !== GIFT_CARD_STATUS.ACTIVE) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Gift Card is ${giftCard.status}`,
    );
  }

  if (giftCard.amount <= 0 || giftCard.currentBalance <= 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Gift Card has zero balance');
  }

  // 2. Find the customer
  const customer = await Customer.findOne({ user: user.id });

  if (!customer) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Customer profile not found');
  }

  // 3. Check if already added
  if (customer.giftCards?.includes(giftCard._id)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Gift Card is already added to your account',
    );
  }

  // 4. Add the gift card to customer
  customer.giftCards = customer.giftCards || [];
  customer.giftCards.push(giftCard._id);

  await customer.save();

  return giftCard;
};

const getMyGiftCardsDataFromDB = async (user: JwtPayload) => {
  const customer = await Customer.findOne({ user: user.id });
  if (!customer) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Customer profile not found');
  }
  const giftCards = await GiftCard.find({
    _id: { $in: customer.giftCards },
  }).select('amount currentBalance');

  return {
    totalGiftCards: giftCards.length,
    totalBalance: giftCards.reduce(
      (acc, giftCard) => acc + giftCard.currentBalance,
      0,
    ),
  };
};

export const GiftCardServices = {
  createGiftCard,
  addGiftCard,
  getMyGiftCardsDataFromDB,
};
