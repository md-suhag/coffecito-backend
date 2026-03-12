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

const getRevenueByMonth = async (year?: number) => {
  const selectedYear = year || new Date().getFullYear();

  const revenueData = await Order.aggregate([
    {
      $match: {
        status: ORDER_STATUS.COMPLETED,
        paymentStatus: PAYMENT_STATUS.PAID,
        createdAt: {
          $gte: new Date(`${selectedYear}-01-01`),
          $lte: new Date(`${selectedYear}-12-31T23:59:59.999Z`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        revenue: { $sum: '$totalAmount' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const formattedData = monthNames.map((month, index) => {
    const monthData = revenueData.find(d => d._id === index + 1);
    return {
      month,
      revenue: monthData ? Math.round(monthData.revenue * 100) / 100 : 0,
      year: selectedYear,
    };
  });

  return formattedData;
};

const getOrdersByCategory = async (
  range: 'this-week' | 'this-month' | 'this-year',
) => {
  const now = new Date();
  let startDate: Date;

  if (range === 'this-week') {
    startDate = new Date(now.setDate(now.getDate() - now.getDay()));
    startDate.setHours(0, 0, 0, 0);
  } else if (range === 'this-month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    // this-year
    startDate = new Date(now.getFullYear(), 0, 1);
  }

  const categoryData = await Order.aggregate([
    {
      $match: {
        status: ORDER_STATUS.COMPLETED,
        paymentStatus: PAYMENT_STATUS.PAID,
        createdAt: { $gte: startDate },
      },
    },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    { $unwind: '$productDetails' },
    {
      $lookup: {
        from: 'categories',
        localField: 'productDetails.category',
        foreignField: '_id',
        as: 'categoryDetails',
      },
    },
    { $unwind: '$categoryDetails' },
    {
      $group: {
        _id: '$categoryDetails._id',
        name: { $first: '$categoryDetails.name' },
        count: { $sum: '$items.quantity' },
      },
    },
  ]);

  const totalItems = categoryData.reduce((acc, curr) => acc + curr.count, 0);

  const formattedData = categoryData.map(item => ({
    category: item.name,
    count: item.count,
    percentage:
      totalItems > 0 ? Math.round((item.count / totalItems) * 100) : 0,
  }));

  return formattedData;
};

const getRecentOrdersFromDB = async () => {
  const result = await Order.find({
    paymentStatus: PAYMENT_STATUS.PAID,
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('customer', 'name email phone profileImage')
    .populate('store', 'name');

  return result;
};

export const AnalyticsServices = {
  getSummaryCardsData,
  getRevenueByMonth,
  getOrdersByCategory,
  getRecentOrdersFromDB,
};
