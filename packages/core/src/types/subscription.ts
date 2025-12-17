/**
 * Subscription Service 类型定义
 */

export interface Plan {
  planId: string
  name: string
  description: string
  price: number
  currency: string
  durationDays: number
  type: string
  appId: string
}

export interface PlanPricing {
  planPricingId: number
  planId: string
  countryCode: string
  price: number
  currency: string
}

export interface ListPlansReply {
  plans: Plan[]
}

export interface CreatePlanRequest {
  name: string
  description?: string
  price: number
  currency: string
  durationDays: number
  type: string
}

export interface CreatePlanReply {
  plan: Plan
}

export interface UpdatePlanRequest {
  planId: string
  name?: string
  description?: string
  price?: number
  currency?: string
  durationDays?: number
  type?: string
}

export interface UpdatePlanReply {
  plan: Plan
}

export interface DeletePlanReply {
  planId: string
}

export interface ListPlanPricingsReply {
  pricings: PlanPricing[]
}

export interface CreatePlanPricingRequest {
  planId: string
  countryCode: string
  price: number
  currency: string
}

export interface CreatePlanPricingReply {
  pricing: PlanPricing
}

export interface UpdatePlanPricingRequest {
  planPricingId: number
  price: number
  currency: string
}

export interface UpdatePlanPricingReply {
  pricing: PlanPricing
}

export interface DeletePlanPricingRequest {
  planPricingId: number
}

export interface DeletePlanPricingReply {
  planPricingId: number
}

export interface CreateSubscriptionOrderRequest {
  userId: string
  planId: string
  paymentMethod: 'alipay' | 'wechatpay'
  region?: string
}

export interface CreateSubscriptionOrderReply {
  orderId: string
  paymentId: string
  payUrl: string
  payCode: string
  payParams: string
}

export interface SubscriptionOrderInfo {
  orderId: string
  paymentId: string
  userId: string
  planId: string
  planName?: string
  appId: string
  amount: number
  currency?: string
  paymentStatus: string
  createdAt: number
}

export interface ListSubscriptionOrdersRequest {
  appId: string
  userId?: string
  planId?: string
  status?: string
  page?: number
  pageSize?: number
}

export interface ListSubscriptionOrdersReply {
  orders: SubscriptionOrderInfo[]
  total: number
  page: number
  pageSize: number
}

export interface GetSubscriptionOrderRequest {
  orderId: string
}

export interface GetSubscriptionOrderReply {
  order: SubscriptionOrderInfo
}

export interface AppSubscriptionInfo {
  subscriptionId: number
  userId: string
  planId: string
  planName?: string
  appId: string
  startTime: number
  endTime: number
  status: string
  orderId: string
  autoRenew: boolean
  createdAt: number
  updatedAt: number
}

export interface ListAppSubscriptionsRequest {
  appId: string
  status?: string
  userId?: string
  page?: number
  pageSize?: number
}

export interface ListAppSubscriptionsReply {
  subscriptions: AppSubscriptionInfo[]
  total: number
  page: number
  pageSize: number
}

export interface SubscriptionHistoryItem {
  id: number
  userId: string
  planId: string
  planName: string
  startTime: number
  endTime: number
  status: string
  action: string
  createdAt: number
}

export interface GetAppSubscriptionHistoryRequest {
  appId: string
  userId?: string
  action?: string
  startTime?: number
  endTime?: number
  page?: number
  pageSize?: number
}

export interface GetAppSubscriptionHistoryReply {
  items: SubscriptionHistoryItem[]
  total: number
  page: number
  pageSize: number
}

export interface GetMySubscriptionRequest {
  userId: string
}

export interface GetMySubscriptionReply {
  isActive: boolean
  planId: string
  startTime: number
  endTime: number
  status: string
  autoRenew: boolean
}

export interface CancelSubscriptionRequest {
  userId: string
  reason?: string
}

export interface PauseSubscriptionRequest {
  userId: string
  reason?: string
}

export interface ResumeSubscriptionRequest {
  userId: string
}

export interface GetSubscriptionHistoryRequest {
  userId: string
  page?: number
  pageSize?: number
}

export interface GetSubscriptionHistoryReply {
  items: SubscriptionHistoryItem[]
  total: number
  page: number
  pageSize: number
}

export interface SetAutoRenewRequest {
  userId: string
  autoRenew: boolean
}
