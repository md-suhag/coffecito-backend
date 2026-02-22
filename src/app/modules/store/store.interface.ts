import { Model } from 'mongoose';

export type IStoreHours = {
  day: string;
  open: string;
  close: string;
};

export type IStore = {
  name: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: number[];
  };
  phone: string;
  hours: IStoreHours[];
  stripeAccountId?: string;
  isConnectedAccountReady?: boolean;
  isActive: boolean;
  about?: string;
};

export type StoreModel = Model<IStore>;
