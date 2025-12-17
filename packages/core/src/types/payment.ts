/**
 * Payment Service 类型定义
 */

export type PaymentMethod = 'alipay' | 'wechatpay' | 'stripe' | 'paypal' | 'applepay' | 'googlepay'

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'closed' | 'refunded' | 'partially_refunded'

export interface CreatePaymentRequest {
  orderId: string
  uid: string
  source: string
  amount: number
  currency: string
  method: PaymentMethod
  subject: string
  returnUrl?: string
  notifyUrl?: string
  clientIp?: string
}

export interface CreatePaymentReply {
  paymentId: string
  status: PaymentStatus
  payUrl: string
  payCode: string
  payParams: string
}

export interface GetPaymentRequest {
  paymentId?: string
  orderId?: string
}

export interface GetPaymentReply {
  paymentId: string
  orderId: string
  uid: string
  amount: number
  currency: string
  status: PaymentStatus
  channelTxnId?: string
  paidAt?: number
}

export interface RefundPaymentRequest {
  paymentId: string
  amount: number
  reason: string
}

export interface RefundPaymentReply {
  refundId: string
  status: 'success' | 'failed'
}

export interface RevenueStats {
  todayRevenue: number
  monthRevenue: number
  totalRevenue: number
  yesterdayRevenue: number
  lastMonthRevenue: number
  todayCount: number
  monthCount: number
  totalCount: number
}

export interface AppRevenueStats {
  appId: string
  totalRevenue: number
  monthRevenue: number
  todayRevenue: number
  totalCount: number
  monthCount: number
  todayCount: number
}

export interface TransactionRecord {
  paymentId: string
  orderId: string
  appId: string
  uid: string
  amount: number
  currency: string
  status: PaymentStatus
  method: PaymentMethod
  subject: string
  paidAt?: number
  createdAt: number
}

export interface ListTransactionsRequest {
  page?: number
  pageSize?: number
  status?: PaymentStatus
  startTime?: number
  endTime?: number
}

export interface ListTransactionsReply {
  transactions: TransactionRecord[]
  total: number
  page: number
  pageSize: number
}
