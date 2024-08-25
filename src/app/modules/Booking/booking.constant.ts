export const PAYMENT_METHOD = {
  credit_card: 'credit_card',
  paypal: 'paypal',
  bank_transfer: 'bank_transfer',
} as const;

export const PAYMENT_STATUS = {
  pending: 'pending',
  completed: 'completed',
  failed: 'failed',
} as const;

export const BOOKING_STATUS = {
  pending: 'pending',
  confirmed: 'confirmed',
  canceled: 'canceled',
} as const;
