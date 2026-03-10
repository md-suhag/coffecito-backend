import { Schema, model } from 'mongoose';
import { IOrder, OrderModel } from './order.interface';
import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from './order.constants';

const selectedOptionSchema = new Schema(
  {
    customizationId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },

    // for single / multi
    optionId: {
      type: Schema.Types.ObjectId,
    },
    optionLabel: {
      type: String,
    },
    optionPrice: {
      type: Number,
      default: 0,
    },

    // for quantity type
    quantity: {
      type: Number,
    },
    pricePerUnit: {
      type: Number,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    basePrice: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    selectedCustomizations: [selectedOptionSchema],

    unitFinalPrice: {
      type: Number,
      required: true,
    },

    itemTotalPrice: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder, OrderModel>(
  {
    store: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },

    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },

    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
    },

    taxAmount: {
      type: Number,
      default: 0,
    },

    tipAmount: {
      type: Number,
      default: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },

    orderStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true,
    },

    pickupTime: {
      type: Date,
    },

    pointsEarned: {
      type: Number,
      default: 0,
    },
    loyaltyPointsUsed: {
      type: Number,
      default: 0,
    },
    paymentId: {
      type: String,
      index: true,
    },

    statusLogs: [
      {
        status: {
          type: String,
          enum: Object.values(ORDER_STATUS),
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
