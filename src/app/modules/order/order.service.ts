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
        customer: customerRecord._id,
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

      const walletTx = await WalletTransaction.create(
        [
          {
            user: userId,
            wallet: wallet._id,
            type: WALLET_TRANSACTION_TYPE.SPEND,
            amount: totalCartAmount,
            balanceAfter: wallet.balance,
            status: WALLET_TRANSACTION_STATUS.SUCCESS,
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

export const OrderServices = {
  createOrderIntoDB,
};
