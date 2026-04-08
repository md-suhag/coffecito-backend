import { Model, Types } from 'mongoose';

export type ISelectedCustomization = {
  customizationId: Types.ObjectId;
  name: string;
  optionId?: Types.ObjectId;
  optionLabel?: string;
  optionPrice?: number;
  quantity?: number;
  pricePerUnit?: number;
  totalPrice?: number;
};

export type ICartItem = {
  _id?: Types.ObjectId;
  product: Types.ObjectId;
  productName: string;
  basePrice: number;
  quantity: number;
  selectedCustomizations: ISelectedCustomization[];
  unitFinalPrice: number;
  itemTotalPrice: number;
};

export type ICart = {
  user: Types.ObjectId;
  items: ICartItem[];
  totalPrice: number;
  totalQuantity: number;
  tipAmount: number;
  redeemLoyaltyPoints: number;
  loyaltyPointDiscount: number;
  totalPayableAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CartModel = Model<ICart>;
