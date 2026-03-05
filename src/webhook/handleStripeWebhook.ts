import { Request, Response } from 'express';
import stripe from '../config/stripe';
import config from '../config';
import Stripe from 'stripe';
import { handleCheckoutSessionCompleted } from './handleCheckoutSessionCompleted';
import { handleCheckoutSessionExpired } from './handleCheckoutSessionExpired';
import { StripeEvent } from '../app/modules/stripeEvent/stripeEvent.model';
import { handlePaymentIntentSucceeded } from './handlePaymentIntentSucceeded';

export const handleStripeWebhook = async (req: Request, res: Response) => {
  let event: Stripe.Event;
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    console.error('Missing Stripe signature header');
    return res.status(400).json({ error: 'Missing stripe signature header' });
  }
  const platformSecret = config.stripe.stripeWebhookSecret;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      platformSecret as string,
    );
  } catch (err) {
    console.error(
      '❌ Webhook signature verification failed:',
      (err as Error).message,
    );
    return res.sendStatus(400);
  }

  const alreadyProcessed = await StripeEvent.exists({
    eventId: event.id,
    isProcessed: true,
  });
  if (alreadyProcessed) {
    return;
  }

  try {
    switch (event.type) {
      // case 'checkout.session.completed':
      //   await handleCheckoutSessionCompleted(event as Stripe.Event);
      //   break;
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event as Stripe.Event);
        break;
      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event as Stripe.Event);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).send({ received: true });
  } catch (error) {
    console.error('Error handling Stripe event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while processing Stripe webhook',
      error: (error as Error)?.message,
    });
  }
};
