import QueryBuilder from '../../builder/QueryBuilder';
import { IOrder } from './order.interface';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { Cart } from '../cart/cart.model';
import { Product } from '../product/product.model';
import { CUSTOMIZATION_TYPE } from '../product/product.constants';
import { Order } from './order.model';
import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  LOYALTY_POINTS_PER_DOLLAR,
} from './order.constants';
import { generateOrderId } from '../../../util/generateOrderId';
import { Customer } from '../customer/customer.model';
import stripe from '../../../config/stripe';
import config from '../../../config';
import { Wallet } from '../wallet/wallet.model';
import { WalletTransaction } from '../walletTransaction/walletTransaction.model';
import {
  WALLET_TRANSACTION_STATUS,
  WALLET_TRANSACTION_TYPE,
} from '../walletTransaction/walletTransaction.constants';
import { GiftCard } from '../giftCard/giftCard.model';
import { GiftCardTransaction } from '../giftCardTransaction/giftCardTransaction.model';
import {
  GIFT_CARD_TRANSACTION_STATUS,
  GIFT_CARD_TRANSACTION_TYPE,
} from '../giftCardTransaction/giftCardTransaction.constants';
import { GIFT_CARD_STATUS } from '../giftCard/giftCard.constants';
import { Payment } from '../payment/payment.model';
import { User } from '../user/user.model';
import { calculateDistanceKm } from '../../../util/calculateDistance';

const createOrderIntoDB = async (
  userId: string,
  payload: {
    paymentMethod: PAYMENT_METHOD;
    tipAmount: number;
    useLoyaltyPoints: boolean;
    pickupTime?: string;
  },
) => {
  const dbSession = await mongoose.startSession();
  try {
    dbSession.startTransaction();

    // 1. Fetch Cart
    const cart = await Cart.findOne({ user: userId }).session(dbSession);
    if (!cart || cart.items.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cart is empty');
    }

    // 2. Group items by store and re-calculate prices from DB
    const storeOrders: Record<string, any> = {};

    for (const item of cart.items) {
      const product = await Product.findById(item.product)
        .populate('store')
        .session(dbSession);
      if (!product) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          `Product ${item.productName} not found`,
        );
      }

      const storeId = product.store._id.toString();
      if (!storeOrders[storeId]) {
        storeOrders[storeId] = {
          items: [],
          subtotal: 0,
          storeId: product.store._id,
          storeRecord: product.store,
        };
      }

      // Re-calculate unit price from DB to ensure sync
      let unitFinalPrice = product.basePrice;
      const processedCustomizations = [];

      for (const selected of item.selectedCustomizations) {
        const dbCust = product.customizations.find(
          (c: any) => c._id.toString() === selected.customizationId.toString(),
        );
        if (dbCust) {
          if (selected.optionId) {
            const dbOpt = dbCust.options?.find(
              (o: any) => o._id.toString() === selected.optionId?.toString(),
            ) as any;
            if (dbOpt) {
              unitFinalPrice += dbOpt.price;
              processedCustomizations.push({
                ...selected,
                optionPrice: dbOpt.price,
                optionLabel: dbOpt.label,
              });
            }
          } else if (dbCust.type === CUSTOMIZATION_TYPE.QUANTITY) {
            const quantity =
              selected.quantity !== undefined ? selected.quantity : 1;
            const pricePerUnit = dbCust.pricePerUnit || 0;
            const totalPrice = quantity * pricePerUnit;
            unitFinalPrice += totalPrice;
            processedCustomizations.push({
              ...selected,
              quantity,
              pricePerUnit,
              totalPrice,
            });
          }
        }
      }

      const itemTotalPrice = unitFinalPrice * item.quantity;
      storeOrders[storeId].items.push({
        product: product._id,
        productName: product.name,
        basePrice: product.basePrice,
        quantity: item.quantity,
        selectedCustomizations: processedCustomizations,
        unitFinalPrice,
        itemTotalPrice,
      });
      storeOrders[storeId].subtotal += itemTotalPrice;
    }

    // 3. Prepare Order Data
    const storeIds = Object.keys(storeOrders);
    let totalCartAmount = 0;
    const ordersToCreate: any[] = [];
    const tipAmount = payload.tipAmount || 0;
    const tipPerStore = tipAmount / storeIds.length;

    const customerRecord = await Customer.findOne({ user: userId }).session(
      dbSession,
    );
    if (!customerRecord) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Customer profile not found');
    }

    // Handle Loyalty Points Logic (10 points = $1)
    let totalLoyaltyDiscount = 0;
    let pointsToDeduct = 0;
    if (
      payload.useLoyaltyPoints &&
      customerRecord.loyaltyPoints >= LOYALTY_POINTS_PER_DOLLAR
    ) {
      const totalSubtotal = storeIds.reduce(
        (acc, sid) => acc + storeOrders[sid].subtotal,
        0,
      );
      const possibleDiscount =
        customerRecord.loyaltyPoints / LOYALTY_POINTS_PER_DOLLAR;
      totalLoyaltyDiscount = Math.min(possibleDiscount, totalSubtotal);
      pointsToDeduct = Math.round(
        totalLoyaltyDiscount * LOYALTY_POINTS_PER_DOLLAR,
      );

      // Deduct points from customer immediately since it's validated
      customerRecord.loyaltyPoints -= pointsToDeduct;
      await customerRecord.save({ session: dbSession });
    }

    const totalOrderSubtotal = storeIds.reduce(
      (acc, sid) => acc + storeOrders[sid].subtotal,
      0,
    );

    for (const storeId of storeIds) {
      const storeData = storeOrders[storeId];
      const orderId = await generateOrderId();

      // Proportional discount if applicable
      const orderProportion =
        totalOrderSubtotal > 0 ? storeData.subtotal / totalOrderSubtotal : 0;
      const orderDiscount = totalLoyaltyDiscount * orderProportion;
      const orderPointsUsed = pointsToDeduct * orderProportion;

      const taxAmount = 0;
      const totalAmount =
        storeData.subtotal + taxAmount + tipPerStore - orderDiscount;
      totalCartAmount += totalAmount;
      storeOrders[storeId].totalAmount = totalAmount;

      const orderData = {
        store: storeData.storeId,
        customer: userId,
        orderId,
        items: storeData.items,
        subtotal: storeData.subtotal,
        taxAmount,
        tipAmount: tipPerStore,
        discountAmount: orderDiscount,
        totalAmount,
        paymentMethod: payload.paymentMethod,
        paymentStatus: PAYMENT_STATUS.PENDING,
        orderStatus: ORDER_STATUS.PENDING,
        loyaltyPointsUsed: Math.round(orderPointsUsed),
        pickupTime: payload.pickupTime
          ? new Date(payload.pickupTime)
          : undefined,
        statusLogs: [{ status: ORDER_STATUS.PENDING, timestamp: new Date() }],
        paymentId: '', // Placeholder
      };
      ordersToCreate.push(orderData);
    }

    // 4. Create Orders (Initially PENDING)
    const createdOrders = await Order.create(ordersToCreate, {
      session: dbSession,
    });
    const orderIds = createdOrders.map(o => o._id.toString());

    // 5. Handle Specific Payment Methods
    let paymentResult: any = {};

    if (payload.paymentMethod === PAYMENT_METHOD.WALLET) {
      const wallet = await Wallet.findOne({ user: userId }).session(dbSession);
      if (!wallet || wallet.balance < totalCartAmount) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Insufficient wallet balance',
        );
      }

      wallet.balance -= totalCartAmount;
      await wallet.save({ session: dbSession });

      const firstItem = cart.items[0];
      const title =
        cart.items.length > 1
          ? `${firstItem.productName} & ${cart.items.length - 1} more`
          : firstItem.productName;

      const walletTx = await WalletTransaction.create(
        [
          {
            user: userId,
            wallet: wallet._id,
            type: WALLET_TRANSACTION_TYPE.SPEND,
            amount: totalCartAmount,
            balanceAfter: wallet.balance,
            status: WALLET_TRANSACTION_STATUS.SUCCESS,
            title,
            relatedOrder: orderIds[0], // Linking to the first order ID (multi-store orders share one payment/transaction record in this context usually)
          },
        ],
        { session: dbSession },
      );

      // Mark orders as PAID
      await Order.updateMany(
        { _id: { $in: orderIds } },
        {
          paymentStatus: PAYMENT_STATUS.PAID,
          paymentId: walletTx[0]._id.toString(),
        },
        { session: dbSession },
      );

      // Clear Cart
      cart.items = [];
      cart.totalPrice = 0;
      cart.totalQuantity = 0;
      await cart.save({ session: dbSession });
    } else if (payload.paymentMethod === PAYMENT_METHOD.GIFT_CARD) {
      const availableGiftCards = await GiftCard.find({
        _id: { $in: customerRecord.giftCards },
        status: GIFT_CARD_STATUS.ACTIVE,
        currentBalance: { $gt: 0 },
      }).session(dbSession);

      const totalGCBalance = availableGiftCards.reduce(
        (acc, gc) => acc + gc.currentBalance,
        0,
      );
      if (totalGCBalance < totalCartAmount) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Insufficient gift card balance',
        );
      }

      let remainingToDeduct = totalCartAmount;
      for (const gc of availableGiftCards) {
        if (remainingToDeduct <= 0) break;
        const deductAmount = Math.min(gc.currentBalance, remainingToDeduct);
        gc.currentBalance -= deductAmount;
        remainingToDeduct -= deductAmount;
        await gc.save({ session: dbSession });

        await GiftCardTransaction.create(
          [
            {
              giftCard: gc._id,
              type: GIFT_CARD_TRANSACTION_TYPE.REDEEM,
              amount: deductAmount,
              balanceAfter: gc.currentBalance,
              status: GIFT_CARD_TRANSACTION_STATUS.SUCCESS,
            },
          ],
          { session: dbSession },
        );
      }

      // Mark orders as PAID
      await Order.updateMany(
        { _id: { $in: orderIds } },
        { paymentStatus: PAYMENT_STATUS.PAID },
        { session: dbSession },
      );

      cart.items = [];
      cart.totalPrice = 0;
      cart.totalQuantity = 0;
      await cart.save({ session: dbSession });
    } else if (payload.paymentMethod === PAYMENT_METHOD.STRIPE) {
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Coffecito Order Payment',
                description: `Orders: ${orderIds.join(', ')}`,
              },
              unit_amount: Math.round(totalCartAmount * 100),
            },
            quantity: 1,
          },
        ],
        success_url: `${config.website_url}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.website_url}/payment-cancel`,
        metadata: {
          type: 'order_payment',
          userId,
          orderIds: JSON.stringify(orderIds),
          storeBreakdown: JSON.stringify(
            storeIds.map(sid => ({
              storeId: sid,
              amount: storeOrders[sid].totalAmount,
              stripeAccountId: storeOrders[sid].storeRecord?.stripeAccountId,
            })),
          ),
        },
        payment_intent_data: {
          transfer_group: orderIds[0],
          metadata: {
            type: 'order_payment',
            userId,
            orderIds: JSON.stringify(orderIds),
            storeBreakdown: JSON.stringify(
              storeIds.map(sid => ({
                storeId: sid,
                amount: storeOrders[sid].totalAmount,
                stripeAccountId: storeOrders[sid].storeRecord?.stripeAccountId,
              })),
            ),
          },
        },
      });

      paymentResult = { checkoutUrl: stripeSession.url };

      // Update orders with paymentId (Session ID)
      await Order.updateMany(
        { _id: { $in: orderIds } },
        { paymentId: stripeSession.id },
        { session: dbSession },
      );
    }

    await dbSession.commitTransaction();
    dbSession.endSession();

    return {
      orders: createdOrders,
      paymentResult,
    };
  } catch (error) {
    await dbSession.abortTransaction();
    dbSession.endSession();
    throw error;
  }
};

const getMyUpcomingOrdersFromDB = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const orderQuery = new QueryBuilder(
    Order.find({
      customer: userId,
      orderStatus: {
        $in: ['pending', 'processing', 'ready'],
      },
    })
      .select('orderId items totalAmount orderStatus')
      .populate('items.product', 'name image readyTime'),
    query,
  )
    .sort()
    .paginate();

  const [orders, meta] = await Promise.all([
    orderQuery.modelQuery,
    orderQuery.getPaginationInfo(),
  ]);

  const formattedOrders = orders.map(order => {
    const totalItems = order.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    const productNames = order.items.map(i => i.productName);

    const readyTime = Math.max(
      ...order.items.map(i => (i.product as any)?.readyTime || 0),
    );

    return {
      _id: order._id,
      orderId: order.orderId,
      orderStatus: order.orderStatus,
      totalItems,
      orderTotal: order.totalAmount,
      productNames,
      readyTime,
      previewImage: (order.items[0]?.product as any)?.image,
    };
  });

  return {
    orders: formattedOrders,
    meta,
  };
};

const getMyCompletedOrdersFromDB = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const completedOrderQuery = new QueryBuilder(
    Order.find({
      customer: userId,
      orderStatus: {
        $in: [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED],
      },
    }).populate('store', 'name image address'),
    query,
  )
    .sort()
    .paginate();

  const [orders, meta] = await Promise.all([
    completedOrderQuery.modelQuery,
    completedOrderQuery.getPaginationInfo(),
  ]);

  const formattedOrders = orders.map(order => {
    const totalItems = order.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    const productNames = order.items.map(i => i.productName);

    const readyTime = Math.max(
      ...order.items.map(i => (i.product as any)?.readyTime || 0),
    );

    return {
      _id: order._id,
      orderId: order.orderId,
      orderStatus: order.orderStatus,
      totalItems,
      orderTotal: order.totalAmount,
      productNames,
      readyTime,
      previewImage: (order.items[0]?.product as any)?.image,
    };
  });

  return {
    orders: formattedOrders,
    meta,
  };
};

const getMyOrderDetailsFromDB = async (userId: string, orderId: string) => {
  const user = await User.findById(userId).select('location');

  const order = await Order.findOne({
    _id: orderId,
    customer: userId,
  })
    .populate('store', 'name location')
    .populate('items.product', 'image readyTime');

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found');
  }

  let distanceKm: number | null = null;

  if (
    user?.location?.latitude &&
    user?.location?.longitude &&
    (order.store as any)?.location?.coordinates
  ) {
    const [storeLng, storeLat] = (order.store as any).location.coordinates;

    distanceKm = calculateDistanceKm(
      user.location.latitude,
      user.location.longitude,
      storeLat,
      storeLng,
    );
  }

  const readyTime = Math.max(
    ...order.items.map(item => (item.product as any)?.readyTime || 0),
  );

  const items = order.items.map(item => ({
    _id: item.product?._id,
    productName: item.productName,
    image: (item.product as any)?.image,
    quantity: item.quantity,
    unitPrice: item.unitFinalPrice,
    totalPrice: item.itemTotalPrice,
  }));

  return {
    _id: order._id,
    orderId: order.orderId,
    orderStatus: order.orderStatus,
    createdAt: order.createdAt,

    store: {
      id: order.store?._id,
      name: (order.store as any)?.name,
      distanceKm: distanceKm ? Number(distanceKm.toFixed(1)) : null,
    },

    readyTime,

    subtotal: order.subtotal,
    taxAmount: order.taxAmount,
    tipAmount: order.tipAmount,
    discountAmount: order.discountAmount,
    totalAmount: order.totalAmount,

    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,

    pointsEarned: order.pointsEarned,
    loyaltyPointsUsed: order.loyaltyPointsUsed,

    items,
  };
};
export const OrderServices = {
  createOrderIntoDB,
  getMyUpcomingOrdersFromDB,
  getMyCompletedOrdersFromDB,
  getMyOrderDetailsFromDB,
};
