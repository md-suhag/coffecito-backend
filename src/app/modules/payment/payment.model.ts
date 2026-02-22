import { Schema, model } from 'mongoose';
import { IPayment, PaymentModel } from './payment.interface';

const paymentSchema = new Schema<IPayment, PaymentModel>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    amount: {
      type: Number,
      required: true,
    },
    eventId: {
      type: String,
    },
    paymentGatewayData: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

export const Payment = model<IPayment, PaymentModel>('Payment', paymentSchema);
