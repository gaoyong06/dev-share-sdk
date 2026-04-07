/**
 * Subscription Service 类型定义
 * 与 subscription-service/api/subscription/v1/subscription.proto 中 JSON（camelCase）字段一致；无 durationDays。
 */

/** 套餐计费周期，对应 proto Plan.period_type */
export type PlanPeriodType = 'DAY' | 'MONTH' | 'YEAR' | 'FOREVER'

/** 对应 proto message Plan */
export interface Plan {
  planId: string
  name: string
  description: string
  price: number
  currency: string
  /** 产品线档位：free / pro / enterprise */
  type: string
  appId: string
  /** DAY/MONTH/YEAR/FOREVER */
  periodType: PlanPeriodType | string
  intervalCount: number
  features: string[]
  pricings: PlanPricing[]
}

/** 对应 proto message PlanPricing（planPricingId 为 uint64，JSON 多为 number） */
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
  /** 目标应用 ID（请求体与网关 Query/Header 一致） */
  appId: string
  name: string
  description?: string
  price: number
  currency: string
  periodType: PlanPeriodType | string
  intervalCount: number
  /** 权益 i18n key */
  features?: string[]
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
  periodType?: PlanPeriodType | string
  intervalCount?: number
  features?: string[]
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

/** 对应 proto message AppSubscriptionInfo（subscriptionId 为 uint64） */
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

/** 对应 proto message SubscriptionHistoryItem（id 为 uint64） */
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

/** 对应 proto message SubscriptionInfo */
export interface SubscriptionInfo {
  userId: string
  planId: string
  planName: string
  startTime: number
  endTime: number
  autoRenew: boolean
  amount: number
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
