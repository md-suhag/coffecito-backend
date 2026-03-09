import { IStore } from './store.interface';
import { Store } from './store.model';

import { STORE_SEARCHABLE_FIELDS } from './store.constants';
import QueryBuilder from '../../builder/QueryBuilder';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import stripe from '../../../config/stripe';
import config from '../../../config';
import { Product } from '../product/product.model';
import { PRODUCT_SEARCHABLE_FIELDS } from '../product/product.constants';

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

const getAllStoresForCustomerFromDB = async (
  query: Record<string, unknown>,
) => {
  const { longitude, latitude, radius, ...restQuery } = query;
  let modelQuery = Store.find({
    isDeleted: false,
    isActive: true,
  }).select('-stripeAccountId -isConnectedAccountReady');

  if (longitude && latitude) {
    modelQuery = Store.find({
      location: {
        $geoWithin: {
          $centerSphere: [
            [Number(longitude), Number(latitude)],
            10000000 / 6378137, // convert meters to radians (Earth radius in meters)
          ],
        },
      },
    });
  }

  const storesQuery = new QueryBuilder(modelQuery, restQuery)
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

const connectStripeIntoDB = async (id: string) => {
  const store = await Store.findById(id);
  if (!store) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Store not found');
  }

  // Case 1: Account already connected and ready
  if (store.stripeAccountId && store.isConnectedAccountReady) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Your Stripe account is already connected and ready to use.',
    );
  }

  // Case 2: Account exists but onboarding not complete → create onboarding link
  if (store.stripeAccountId && !store.isConnectedAccountReady) {
    const accountLink = await stripe.accountLinks.create({
      account: store.stripeAccountId,
      refresh_url: `${config.website_url}/refresh`,
      return_url: `${config.website_url}/success`,
      type: 'account_onboarding',
    });

    return {
      message: 'Complete your Stripe account onboarding.',
      url: accountLink.url,
    };
  }

  // Case 3: No Stripe account yet → create new account
  const account = await stripe.accounts.create({
    type: 'express',
    email: config.email.user,
  });

  store.stripeAccountId = account.id;
  store.isConnectedAccountReady = false;
  await store.save();

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${config.website_url}/refresh`,
    return_url: `${config.website_url}/success`,
    type: 'account_onboarding',
  });

  return {
    message: 'New Stripe account created. Complete onboarding.',
    url: accountLink.url,
  };
};

const getAllProductsOfAStoreFromDB = async (
  id: string,
  query: Record<string, unknown>,
) => {
  const productsQuery = new QueryBuilder(
    Product.find({ store: id }).select(
      'store category name image readyTime basePrice dietaryLabels',
    ),
    query,
  )
    .search(PRODUCT_SEARCHABLE_FIELDS)
    .filter()
    .sort()
    .paginate();

  const [products, meta] = await Promise.all([
    productsQuery.modelQuery,
    productsQuery.getPaginationInfo(),
  ]);

  return {
    products,
    meta,
  };
};

export const StoreServices = {
  createStoreIntoDB,
  getAllStoresFromDB,
  getAllStoresForCustomerFromDB,
  updateStoreIntoDB,
  deleteStoreFromDB,
  connectStripeIntoDB,
  getAllProductsOfAStoreFromDB,
};
