export const ORDER_CONSTANT = 'someValue';

export enum PAYMENT_METHOD {
  STRIPE = 'stripe',
  WALLET = 'wallet',
  GIFT_CARD = 'gift card',
}

export enum PAYMENT_STATUS {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

export enum ORDER_STATUS {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
