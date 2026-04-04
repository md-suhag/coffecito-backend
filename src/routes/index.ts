import { analyticsRoutes } from '../app/modules/analytics/analytics.route';
import { favoriteRoutes } from '../app/modules/favorite/favorite.route';
import { emailSubscriptionRoutes } from '../app/modules/emailSubscription/emailSubscription.route';
import { cartRoutes } from '../app/modules/cart/cart.route';
import { stripeEventRoutes } from '../app/modules/stripeEvent/stripeEvent.route';
import { adminRoutes } from '../app/modules/admin/admin.route';
import { categoryRoutes } from '../app/modules/category/category.route';
import { promotionsRoutes } from '../app/modules/promotions/promotions.route';
import { notificationRoutes } from '../app/modules/notification/notification.route';
import { productRoutes } from '../app/modules/product/product.route';
import { paymentRoutes } from '../app/modules/payment/payment.route';
import { storeRoutes } from '../app/modules/store/store.route';
import { orderRoutes } from '../app/modules/order/order.route';
import { giftCardTransactionRoutes } from '../app/modules/giftCardTransaction/giftCardTransaction.route';
import { giftCardRoutes } from '../app/modules/giftCard/giftCard.route';
import { walletTransactionRoutes } from '../app/modules/walletTransaction/walletTransaction.route';
import { walletRoutes } from '../app/modules/wallet/wallet.route';
import { customerRoutes } from '../app/modules/customer/customer.route';
import { pointTransactionRoutes } from '../app/modules/pointTransaction/pointTransaction.route';
import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { storeAdminRoutes } from '../app/modules/store/store.admin.route';
import { CustomizationOptionRoutes } from '../app/modules/customizationOption/customizationOption.route';
import { DisclaimerRoutes } from '../app/modules/disclaimer/disclaimer.route';

const router = express.Router();

const moduleRoutes = [
  { path: '/users', route: UserRoutes },
  { path: '/auth', route: AuthRoutes },
  { path: '/customers', route: customerRoutes },
  { path: '/wallets', route: walletRoutes },
  { path: '/walletTransactions', route: walletTransactionRoutes },
  { path: '/giftCards', route: giftCardRoutes },
  { path: '/giftCardTransactions', route: giftCardTransactionRoutes },
  { path: '/orders', route: orderRoutes },
  { path: '/stores', route: storeRoutes },
  { path: '/admin/stores', route: storeAdminRoutes },
  { path: '/payments', route: paymentRoutes },
  { path: '/products', route: productRoutes },
  { path: '/notifications', route: notificationRoutes },
  { path: '/promotions', route: promotionsRoutes },
  { path: '/categories', route: categoryRoutes },
  { path: '/admin', route: adminRoutes },
  { path: '/stripeEvents', route: stripeEventRoutes },
  { path: '/carts', route: cartRoutes },
  { path: '/emailSubscriptions', route: emailSubscriptionRoutes },
  { path: '/favorites', route: favoriteRoutes },
  { path: '/analytics', route: analyticsRoutes },
  { path: '/pointTransactions', route: pointTransactionRoutes },
  { path: '/customizationOptions', route: CustomizationOptionRoutes },
  { path: '/disclaimers', route: DisclaimerRoutes },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
