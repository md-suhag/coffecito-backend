import { Schema, model } from 'mongoose';
import { IOrder, OrderModel } from './order.interface';
import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from './order.constants';

const orderSchema = new Schema<IOrder, OrderModel>(
  {
    store: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        variant: {
          type: String,
        },
        addOns: {
          type: [String],
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHOD,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS,
      default: PAYMENT_STATUS.PENDING,
    },
    orderStatus: {
      type: String,
      enum: ORDER_STATUS,
      default: ORDER_STATUS.PENDING,
    },
    pickupTime: {
      type: Date,
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    tipAmount: {
      type: Number,
      default: 0,
    },
    statusLogs: [
      {
        status: {
          type: String,
          enum: ORDER_STATUS,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Order = model<IOrder, OrderModel>('Order', orderSchema);
