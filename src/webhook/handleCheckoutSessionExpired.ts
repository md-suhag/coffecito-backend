import Stripe from 'stripe';

export const handleCheckoutSessionExpired = async (event: Stripe.Event) => {
  const session = event.data.object as Stripe.Checkout.Session;
};
