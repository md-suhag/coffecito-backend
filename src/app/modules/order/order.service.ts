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
  EARN_POINT_RATE,
} from './order.constants';
import { generateSecureId } from '../../../util/generateId';
import { Customer } from '../customer/customer.model';
import { PointTransaction } from '../pointTransaction/pointTransaction.model';
import { GiftCardTransaction } from '../giftCardTransaction/giftCardTransaction.model';
import { WalletTransaction } from '../walletTransaction/walletTransaction.model';
import stripe from '../../../config/stripe';
import config from '../../../config';
import { Wallet } from '../wallet/wallet.model';
import {
  WALLET_TRANSACTION_STATUS,
  WALLET_TRANSACTION_TYPE,
} from '../walletTransaction/walletTransaction.constants';
import { GiftCard } from '../giftCard/giftCard.model';
import {
  GIFT_CARD_TRANSACTION_STATUS,
  GIFT_CARD_TRANSACTION_TYPE,
} from '../giftCardTransaction/giftCardTransaction.constants';
import { GIFT_CARD_STATUS } from '../giftCard/giftCard.constants';
import { Payment } from '../payment/payment.model';
import { User } from '../user/user.model';
import { calculateDistanceKm } from '../../../util/calculateDistance';
import { NotificationHelper } from '../../../helpers/notificationHelper';
import { NOTIFICATION_TYPE } from '../notification/notification.interface';
import { PointTransactionServices } from '../pointTransaction/pointTransaction.service';
import { POINT_TRANSACTION_TYPE } from '../pointTransaction/pointTransaction.constants';

const createOrderIntoDB = async (
  userId: string,
  payload: {
    paymentMethod: PAYMENT_METHOD;
    tipAmount: number;
    loyaltyPointsToUse: number;
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
        .populate('customizations')
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
        const dbCust = (product.customizations as any[]).find(
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
            const option = dbCust.options?.find(
              (o: any) => o._id?.toString() === selected.optionId?.toString(),
            );

            if (option) {
              const quantity =
                selected.quantity !== undefined ? selected.quantity : 1;
              const pricePerUnit = option.price || 0;
              const totalPrice = quantity * pricePerUnit;
              unitFinalPrice += totalPrice;
              processedCustomizations.push({
                ...selected,
                optionId: (option as any)._id,
                optionLabel: option.label,
                quantity,
                pricePerUnit,
                totalPrice,
              });
            }
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
    const tipPerStore = Math.round((tipAmount / storeIds.length) * 100) / 100;

    const customerRecord = await Customer.findOne({ user: userId }).session(
      dbSession,
    );
    if (!customerRecord) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Customer profile not found');
    }

    // Handle Loyalty Points Logic (2 points = $1)
    let totalLoyaltyDiscount = 0;
    let pointsToDeduct = 0;
    if (payload.loyaltyPointsToUse > 0) {
      if (customerRecord.loyaltyPoints < payload.loyaltyPointsToUse) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Insufficient loyalty points',
        );
      }

      if (payload.loyaltyPointsToUse < LOYALTY_POINTS_PER_DOLLAR) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Minimum ${LOYALTY_POINTS_PER_DOLLAR} points (equivalent to $1) required for redemption`,
        );
      }

      const totalSubtotal = storeIds.reduce(
        (acc, sid) => acc + storeOrders[sid].subtotal,
        0,
      );

      const requestedDiscount =
        payload.loyaltyPointsToUse / LOYALTY_POINTS_PER_DOLLAR;
      totalLoyaltyDiscount = Math.min(requestedDiscount, totalSubtotal);
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
      const orderId = await generateSecureId('ORD-', Order, 'orderId');

      // Proportional discount if applicable
      const orderProportion =
        totalOrderSubtotal > 0 ? storeData.subtotal / totalOrderSubtotal : 0;
      const orderDiscount =
        Math.round(totalLoyaltyDiscount * orderProportion * 100) / 100;
      const orderPointsUsed = pointsToDeduct * orderProportion;

      const taxAmount = 0;
      const totalAmount =
        Math.round(
          (storeData.subtotal + taxAmount + tipPerStore - orderDiscount) * 100,
        ) / 100;
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
        pointsEarned: Math.floor(totalAmount / EARN_POINT_RATE),
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
    const createdOrders = await Order.insertMany(ordersToCreate, {
      session: dbSession,
    });
    const orderIds = createdOrders.map(o => o._id.toString());

    // Record point deduction transaction now that we have order IDs
    if (pointsToDeduct > 0) {
      await PointTransactionServices.createTransaction(
        {
          user: userId as any,
          pointsChange: -pointsToDeduct,
          type: POINT_TRANSACTION_TYPE.SPEND,
          balanceAfter: customerRecord.loyaltyPoints,
          relatedOrderId: createdOrders[0]._id, // Link to the first order of the batch
          transactionId: await generateSecureId(
            'PTXN-',
            PointTransaction,
            'transactionId',
          ),
        },
        dbSession,
      );
    }

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

      const walletTransactionId = await generateSecureId(
        'WTXN-',
        WalletTransaction,
        'transactionId',
      );
      const walletTx = await WalletTransaction.create(
        [
          {
            user: userId,
            wallet: wallet._id,
            type: WALLET_TRANSACTION_TYPE.SPEND,
            amount: totalCartAmount,
            balanceAfter: wallet.balance,
            transactionId: walletTransactionId,
            status: WALLET_TRANSACTION_STATUS.SUCCESS,
            title,
            relatedOrder: orderIds[0],
          },
        ],
        { session: dbSession },
      );

      const internalTransactionId = await generateSecureId(
        'OTXN-',
        Order,
        'transactionId',
      );
      // Mark orders as PAID
      await Order.updateMany(
        { _id: { $in: orderIds } },
        {
          paymentStatus: PAYMENT_STATUS.PAID,
          paymentId: walletTx[0]._id.toString(),
          transactionId: internalTransactionId,
        },
        { session: dbSession },
      );

      // Clear Cart
      cart.items = [];
      cart.totalPrice = 0;
      cart.totalQuantity = 0;
      cart.tipAmount = 0;
      cart.redeemLoyaltyPoints = 0;
      cart.loyaltyPointDiscount = 0;
      cart.totalPayableAmount = 0;
      await cart.save({ session: dbSession });

      // Update last order in customer profile
      await Customer.findOneAndUpdate(
        { user: userId },
        { lastOrder: orderIds[0] },
        { session: dbSession },
      );

      // Trigger Notification
      NotificationHelper.sendAndSaveNotification({
        receiver: userId,
        title: 'Order Placed Successfully! ☕',
        message: `Your order ${createdOrders[0].orderId} has been placed using Wallet.`,
        type: NOTIFICATION_TYPE.ORDER,
        data: { orderId: createdOrders[0]._id.toString() },
      });

      // Earn points for Wallet payment
      await PointTransactionServices.earnPoints(
        userId,
        totalCartAmount,
        orderIds[0],
        dbSession,
      );
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
              user: userId,
              giftCard: gc._id,
              type: GIFT_CARD_TRANSACTION_TYPE.REDEEM,
              amount: deductAmount,
              balanceAfter: gc.currentBalance,
              transactionId: await generateSecureId(
                'GTXN-',
                GiftCardTransaction,
                'transactionId',
              ),
              status: GIFT_CARD_TRANSACTION_STATUS.SUCCESS,
              relatedOrder: orderIds[0],
            },
          ],
          { session: dbSession },
        );
      }

      const internalTransactionIdGC = await generateSecureId(
        'OTXN-',
        Order,
        'transactionId',
      );

      // Mark orders as PAID
      await Order.updateMany(
        { _id: { $in: orderIds } },
        {
          paymentStatus: PAYMENT_STATUS.PAID,
          paymentId: 'GIFT_CARD_PAYMENT', // Placeholder or use common link
          transactionId: internalTransactionIdGC,
        },
        { session: dbSession },
      );

      cart.items = [];
      cart.totalPrice = 0;
      cart.totalQuantity = 0;
      cart.tipAmount = 0;
      cart.redeemLoyaltyPoints = 0;
      cart.loyaltyPointDiscount = 0;
      cart.totalPayableAmount = 0;
      await cart.save({ session: dbSession });

      // Update last order in customer profile
      await Customer.findOneAndUpdate(
        { user: userId },
        { lastOrder: orderIds[0] },
        { session: dbSession },
      );

      // Trigger Notification
      NotificationHelper.sendAndSaveNotification({
        receiver: userId,
        title: 'Order Placed Successfully! ☕',
        message: `Your order ${createdOrders[0].orderId} has been placed using Gift Card.`,
        type: NOTIFICATION_TYPE.ORDER,
        data: { orderId: createdOrders[0]._id.toString() },
      });

      // Earn points for Gift Card payment
      await PointTransactionServices.earnPoints(
        userId,
        totalCartAmount,
        orderIds[0],
        dbSession,
      );
    } else if (payload.paymentMethod === PAYMENT_METHOD.STRIPE) {
      const internalTransactionIdStripe = await generateSecureId(
        'OTXN-',
        Order,
        'transactionId',
      );

      const orderDescription = createdOrders
        .map(
          order =>
            `${order.orderId} (${order.items
              .map(item => `${item.productName} x${item.quantity}`)
              .join(', ')})`,
        )
        .join(' | ');

      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Coffecito Order Payment',
                description: orderDescription,
              },
              unit_amount: Math.round(totalCartAmount * 100),
            },
            quantity: 1,
          },
        ],
        success_url: `${config.website_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.website_url}/payment/cancel`,
        metadata: {
          type: 'order_payment',
          userId,
          orderIds: JSON.stringify(orderIds),
          internalTransactionId: internalTransactionIdStripe,
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
            internalTransactionId: internalTransactionIdStripe,
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

      // Update orders with stripeSession.id and internalTransactionIdStripe
      await Order.updateMany(
        { _id: { $in: orderIds } },
        {
          paymentId: stripeSession.id,
          transactionId: internalTransactionIdStripe,
        },
        { session: dbSession },
      );
    }

    await dbSession.commitTransaction();
    dbSession.endSession();

    // Re-fetch orders to reflect updated status and points
    const finalOrders = await Order.find({ _id: { $in: orderIds } });

    return {
      orders: finalOrders,
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
    .populate('store', 'name location address image')
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
      address: (order.store as any)?.address,
      image: (order.store as any)?.image,
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
const getLastOrderFromDB = async (userId: string) => {
  const customer = await Customer.findOne({ user: userId });
  if (!customer || !customer.lastOrder) {
    return null;
  }

  const order = await Order.findOne({
    _id: customer.lastOrder,
    customer: userId,
  }).populate('items.product', 'image readyTime');

  if (!order) {
    return null;
  }

  const readyTime = Math.max(
    ...order.items.map(item => (item.product as any)?.readyTime || 0),
  );

  return {
    _id: order._id,
    orderId: order.orderId,
    productName: order.items[0]?.productName,
    totalAmount: order.totalAmount,
    orderStatus: order.orderStatus,
    readyTime,
    previewImage: (order.items[0]?.product as any)?.image,
  };
};

const getMyOrderTransactionsFromDB = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const transactionQuery = new QueryBuilder(
    Order.find({
      customer: userId,
    }).select(
      'orderId transactionId totalAmount paymentMethod paymentStatus orderStatus createdAt tipAmount pointsEarned loyaltyPointsUsed',
    ),
    query,
  )
    .sort()
    .paginate();

  const [transactions, meta] = await Promise.all([
    transactionQuery.modelQuery,
    transactionQuery.getPaginationInfo(),
  ]);

  return {
    transactions,
    meta,
  };
};

export const OrderServices = {
  createOrderIntoDB,
  getMyUpcomingOrdersFromDB,
  getMyCompletedOrdersFromDB,
  getMyOrderDetailsFromDB,
  getLastOrderFromDB,
  getMyOrderTransactionsFromDB,
};
