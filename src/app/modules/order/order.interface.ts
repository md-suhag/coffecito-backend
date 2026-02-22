import { Model, Types } from 'mongoose';
import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from './order.constants';

export type IOrderItem = {
  product: Types.ObjectId;
  variant?: String;
  addOns?: String[];
  quantity: number;
  price: number;
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
  totalAmount: number;
  paymentMethod: PAYMENT_METHOD;
  paymentStatus: PAYMENT_STATUS;
  orderStatus: ORDER_STATUS;
  pickupTime?: Date;
  pointsEarned: number;
  tipAmount: number;
  statusLogs: IOrderStatusLog[];
};

export type OrderModel = Model<IOrder>;
