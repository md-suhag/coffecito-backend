import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICategory } from '../category/category.interface';
import { Category } from '../category/category.model';
import { IContactUs } from '../contactUs/contactUs.interface';
import { ContactUs } from '../contactUs/contactUs.model';
import { emailTemplate } from '../../../shared/emailTemplate';
import { emailHelper } from '../../../helpers/emailHelper';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.model';
import { USER_ROLES } from '../user/user.constant';
import {
  CATEGORY_SEARCHABLE_FIELDS,
  EMAIL_SUBSCRIBER_SEARCHABLE_FIELDS,
  ORDER_SEARCHABLE_FIELDS,
  USER_SEARCHABLE_FIELDS,
} from './admin.constants';
import { IUser } from '../user/user.interface';
import { EmailSubscription } from '../emailSubscription/emailSubscription.model';
import { Order } from '../order/order.model';
import { ORDER_STATUS, PAYMENT_STATUS } from '../order/order.constants';
import { NotificationHelper } from '../../../helpers/notificationHelper';
import { NOTIFICATION_TYPE } from '../notification/notification.interface';
import { JwtPayload } from 'jsonwebtoken';

const getAllCategoriesFromDB = async (query: Record<string, any>) => {
  const categoriesQuery = new QueryBuilder(Category.find(), query)
    .sort()
    .paginate()
    .search(CATEGORY_SEARCHABLE_FIELDS);

  const [categories, meta] = await Promise.all([
    categoriesQuery.modelQuery,
    categoriesQuery.getPaginationInfo(),
  ]);

  return { categories, meta };
};

const createCategoryToDB = async (payload: Partial<ICategory>) => {
  const result = await Category.create(payload);
  return result;
};

const updateCategoryToDB = async (id: string, payload: Partial<ICategory>) => {
  const isExistCategory = await Category.findById(id);
  if (!isExistCategory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Category doesn't exist!");
  }
  const result = await Category.findOneAndUpdate({ _id: id }, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const softDeleteCategoryFromDB = async (id: string) => {
  const isExistCategory = await Category.findById(id);
  if (!isExistCategory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Category doesn't exist!");
  }
  const result = await Category.findOneAndUpdate(
    { _id: id },
    { isDeleted: true },
    {
      new: true,
      runValidators: true,
    },
  );
  return result;
};

const contactUs = async (payload: IContactUs) => {
  const result = await ContactUs.create(payload);
  const contactUsEmailTemplate = emailTemplate.contactUs(payload);
  await emailHelper.sendEmail(contactUsEmailTemplate);
  return result;
};

const getAllCustomers = async (query: Record<string, any>) => {
  const customersQuery = new QueryBuilder(
    User.find({
      role: USER_ROLES.CUSTOMER,
    }),
    query,
  )
    .sort()
    .paginate()
    .search(USER_SEARCHABLE_FIELDS);

  const [customers, meta] = await Promise.all([
    customersQuery.modelQuery,
    customersQuery.getPaginationInfo(),
  ]);

  return {
    customers,
    meta,
  };
};

const updateCustomer = async (id: string, payload: Partial<IUser>) => {
  const isExistCustomer = await User.findById(id);
  if (!isExistCustomer) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Customer doesn't exist!");
  }
  const result = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const getAllSubscribers = async (query: Record<string, any>) => {
  const subscribersQuery = new QueryBuilder(EmailSubscription.find(), query)
    .sort()
    .paginate()
    .search(EMAIL_SUBSCRIBER_SEARCHABLE_FIELDS);

  const [subscribers, meta] = await Promise.all([
    subscribersQuery.modelQuery,
    subscribersQuery.getPaginationInfo(),
  ]);

  return {
    subscribers,
    meta,
  };
};

const getAllOrdersFromDB = async (
  query: Record<string, any>,
  user: JwtPayload,
) => {
  const queryObj = { ...query };

  // If user is not super_admin and has a store assigned, restrict to that store
  if (user?.role !== 'super_admin' && user?.store) {
    queryObj.store = user.store;
  }

  const ordersQuery = new QueryBuilder(
    Order.find({
      paymentStatus: PAYMENT_STATUS.PAID,
    }).populate([
      {
        path: 'customer',
        select: 'name email phone address ',
      },
      {
        path: 'store',
        select: 'name address',
      },
    ]),
    queryObj,
  )
    .sort()
    .paginate()
    .filter()
    .search(ORDER_SEARCHABLE_FIELDS);

  const [orders, meta] = await Promise.all([
    ordersQuery.modelQuery,
    ordersQuery.getPaginationInfo(),
  ]);

  return {
    orders,
    meta,
  };
};

const updateOrderFromDB = async (id: string, payload: ORDER_STATUS) => {
  const isExistOrder = await Order.findById(id);
  if (!isExistOrder) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Order doesn't exist!");
  }
  const result = await Order.findOneAndUpdate(
    { _id: id },
    {
      orderStatus: payload,
      statusLogs: {
        status: payload,
        timestamp: new Date(),
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (payload === ORDER_STATUS.READY) {
    await NotificationHelper.sendAndSaveNotification({
      receiver: isExistOrder.customer.toString(),
      title: 'Order is Ready! ☕',
      message: `Your order ${isExistOrder.orderId} is ready for pickup. Come and get it!`,
      type: NOTIFICATION_TYPE.ORDER,
      data: { orderId: isExistOrder._id.toString() },
    });
  }

  return result;
};

const createUserToDB = async (payload: IUser) => {
  const result = await User.create(payload);
  return result;
};

const getRevenue = async (query: Record<string, any>) => {
  const ordersQuery = new QueryBuilder(
    Order.find({
      paymentStatus: PAYMENT_STATUS.PAID,
      orderStatus: ORDER_STATUS.COMPLETED,
    }).select('orderId paymentStatus totalAmount paymentMethod createdAt'),
    query,
  )
    .sort()
    .paginate()
    .filter()
    .search(ORDER_SEARCHABLE_FIELDS);

  const [revenue, meta] = await Promise.all([
    ordersQuery.modelQuery,
    ordersQuery.getPaginationInfo(),
  ]);

  return {
    revenue,
    meta,
  };
};

export const AdminServices = {
  createCategoryToDB,
  updateCategoryToDB,
  contactUs,
  getAllCustomers,
  updateCustomer,
  getAllSubscribers,
  getAllOrdersFromDB,
  updateOrderFromDB,
  createUserToDB,
  getRevenue,
  getAllCategoriesFromDB,
  softDeleteCategoryFromDB,
};
