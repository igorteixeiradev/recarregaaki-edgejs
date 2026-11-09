export const PaymentStatus = {
  Pending: 'PENDING',
  Paid: 'PAID',
  Failed: 'FAILED',
  Canceled: 'CANCELED',
} as const

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]
