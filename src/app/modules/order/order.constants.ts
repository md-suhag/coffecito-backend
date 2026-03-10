export enum PAYMENT_METHOD {
  STRIPE = 'stripe',
  WALLET = 'wallet',
  GIFT_CARD = 'gift_card',
}

export enum PAYMENT_STATUS {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum ORDER_STATUS {
  PENDING = 'pending',
  PROCESSING = 'processing',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export const LOYALTY_POINTS_PER_DOLLAR = 10;
