import mongoose from 'mongoose';
import { StripeEvent } from '../app/modules/stripeEvent/stripeEvent.model';
import Stripe from 'stripe';

export async function withStripeIdempotency(
  event: Stripe.Event,
  fn: (session: mongoose.ClientSession) => Promise<void>,
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Try to create StripeEvent as atomic lock
    const stripeEvent = await StripeEvent.findOneAndUpdate(
      { eventId: event.id },
      {
        $setOnInsert: {
          eventId: event.id,
          type: event.type,
          isProcessed: false,
        },
      },
      { upsert: true, new: true, session },
    );

    if (stripeEvent.isProcessed) {
      await session.commitTransaction();
      session.endSession();
      return; // Already processed
    }

    // Execute your business logic inside the same transaction
    await fn(session);

    // Mark event as processed
    await StripeEvent.updateOne(
      { eventId: event.id },
      { isProcessed: true, processedAt: new Date() },
      { session },
    );

    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}
