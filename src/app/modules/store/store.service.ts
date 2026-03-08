import { IStore } from './store.interface';
import { Store } from './store.model';

const createStoreIntoDB = async (payload: IStore) => {
  const result = await Store.create(payload);
  return result;
};

export const StoreServices = {
  createStoreIntoDB,
};
