import { Model, Types } from 'mongoose';

export type IPayment = {
  order: Types.ObjectId;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  amount: number;
  eventId?: string;
  paymentGatewayData?: Record<string, any>;
};

export type PaymentModel = Model<IPayment>;
