import { IStore } from './store.interface';
import { Store } from './store.model';

import { STORE_SEARCHABLE_FIELDS } from './store.constants';
import QueryBuilder from '../../builder/QueryBuilder';

const createStoreIntoDB = async (payload: IStore) => {
  const result = await Store.create(payload);
  return result;
};

const getAllStoresFromDB = async (query: Record<string, unknown>) => {
  const storesQuery = new QueryBuilder(Store.find(), query)
    .search(STORE_SEARCHABLE_FIELDS)
    .filter()
    .sort()
    .paginate();

  const [stores, meta] = await Promise.all([
    storesQuery.modelQuery,
    storesQuery.getPaginationInfo(),
  ]);

  return {
    stores,
    meta,
  };
};

const updateStoreIntoDB = async (id: string, payload: Partial<IStore>) => {
  const result = await Store.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteStoreFromDB = async (id: string) => {
  const result = await Store.findByIdAndUpdate(
    id,
    { isDeleted: true },
    {
      new: true,
    },
  );
  return result;
};

export const StoreServices = {
  createStoreIntoDB,
  getAllStoresFromDB,
  updateStoreIntoDB,
  deleteStoreFromDB,
};
