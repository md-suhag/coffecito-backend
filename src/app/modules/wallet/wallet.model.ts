import { Schema, model } from 'mongoose';
import { IWallet, WalletModel } from './wallet.interface';

const walletSchema = new Schema<IWallet, WalletModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const Wallet = model<IWallet, WalletModel>('Wallet', walletSchema);
