import { Order } from '../app/modules/order/order.model';

export const generateOrderId = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateString = `${year}${month}${day}`;

  let orderId: string = '';
  let isUnique = false;

  while (!isUnique) {
    const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random
    orderId = `ORD-${dateString}-${random}`;

    // Check if it exists
    const existing = await Order.findOne({ orderId }).lean();
    if (!existing) {
      isUnique = true;
    }
  }

  return orderId;
};
