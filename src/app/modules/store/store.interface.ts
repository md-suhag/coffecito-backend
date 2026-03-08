import { Model } from 'mongoose';
import { STORE_OPEN_DAY } from './store.constants';

export type IStoreHours = {
  day: STORE_OPEN_DAY;
  open: string;
  close: string;
};

export type IStore = {
  name: string;
  image: string;
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
  isDeleted: boolean;
  about?: string;
};

export type StoreModel = Model<IStore>;
