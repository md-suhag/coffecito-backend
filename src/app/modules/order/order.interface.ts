import { Model, Types } from 'mongoose';
import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from './order.constants';

export type ISelectedCustomization = {
  customizationId: Types.ObjectId;
  name: string;

  // For single / multi
  optionId?: Types.ObjectId;
  optionLabel?: string;
  optionPrice?: number;

  // For quantity type
  quantity?: number;
  pricePerUnit?: number;
  totalPrice?: number;
};

export type IOrderItem = {
  product: Types.ObjectId;
  productName: string;
  basePrice: number;
  quantity: number;

  selectedCustomizations: ISelectedCustomization[];

  unitFinalPrice: number;
  itemTotalPrice: number;
};

export type IOrderStatusLog = {
  status: ORDER_STATUS;
  timestamp: Date;
};

export type IOrder = {
  store: Types.ObjectId;
  customer: Types.ObjectId;

  orderId: string;

  items: IOrderItem[];

  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  tipAmount: number;
  totalAmount: number;

  paymentMethod: PAYMENT_METHOD;
  paymentStatus: PAYMENT_STATUS;

  orderStatus: ORDER_STATUS;
  pickupTime?: Date;

  pointsEarned: number;
  loyaltyPointsUsed?: number;

  statusLogs: IOrderStatusLog[];

  paymentId?: string;
  transactionId?: string;
  stripeFee?: number;

  createdAt?: Date;
  updatedAt?: Date;
};

export type OrderModel = Model<IOrder>;
