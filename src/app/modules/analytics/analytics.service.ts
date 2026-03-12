import { ORDER_STATUS, PAYMENT_STATUS } from '../order/order.constants';
import { Order } from '../order/order.model';
import { USER_ROLES } from '../user/user.constant';
import { User } from '../user/user.model';

const getSummaryCardsData = async () => {
  const [totalOrders, totalSales, newCustomersLast30Days, totalGrossRevenue] =
    await Promise.all([
      Order.countDocuments({}),
      Order.aggregate([
        {
          $match: {
            paymentStatus: PAYMENT_STATUS.PAID,
          },
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: '$totalAmount' },
          },
        },
      ]),
      User.countDocuments({
        role: USER_ROLES.CUSTOMER,
        createdAt: {
          $gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
        },
      }),
      Order.aggregate([
        {
          $match: {
            status: ORDER_STATUS.COMPLETED,
            paymentStatus: PAYMENT_STATUS.PAID,
          },
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: '$totalAmount' },
          },
        },
      ]),
    ]);

  return {
    totalOrders,
    totalSales: totalSales[0]?.totalEarnings || 0,
    newCustomersLast30Days,
    totalGrossRevenue: totalGrossRevenue[0]?.totalEarnings || 0,
  };
};

export const AnalyticsServices = {
  getSummaryCardsData,
};
