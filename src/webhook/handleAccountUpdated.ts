import Stripe from 'stripe';
import { Store } from '../app/modules/store/store.model';

export const handleAccountUpdated = async (event: Stripe.Event) => {
  const account = event.data.object as Stripe.Account;

  if (account.charges_enabled && account.details_submitted) {
    await Store.findOneAndUpdate(
      { stripeAccountId: account.id },
      {
        isConnectedAccountReady: true,
        isActive: true,
      },
    );
  }
};
