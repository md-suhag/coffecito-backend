import { Schema, model } from 'mongoose';
import { ICart, CartModel } from './cart.interface';

const selectedCustomizationSchema = new Schema(
  {
    customizationId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    optionId: { type: Schema.Types.ObjectId },
    optionLabel: { type: String },
    optionPrice: { type: Number },
    quantity: { type: Number },
    pricePerUnit: { type: Number },
    totalPrice: { type: Number },
  },
  { _id: false },
);

const cartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  basePrice: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  selectedCustomizations: [selectedCustomizationSchema],
  unitFinalPrice: { type: Number, required: true },
  itemTotalPrice: { type: Number, required: true },
});

const cartSchema = new Schema<ICart, CartModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    totalPrice: { type: Number, required: true, default: 0 },
    totalQuantity: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  },
);

export const Cart = model<ICart, CartModel>('Cart', cartSchema);
