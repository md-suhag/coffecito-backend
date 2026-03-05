import Stripe from 'stripe';
import config from '.';

const stripe = new Stripe(config.stripe.stripeSecretKey as string, {
  apiVersion: '2026-02-25.clover',
});

export default stripe;
