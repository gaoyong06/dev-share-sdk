/**
 * Marketing Service 类型定义
 */

export interface Coupon {
  couponCode: string
  appId?: string
  discountType?: 'percent' | 'fixed'
  discountValue?: number
  currency?: string
  validFrom?: number
  validUntil?: number
  maxUses?: number
  usedCount?: number
  minAmount?: number
  status: 'active' | 'inactive' | 'expired'
  createdAt?: number
  updatedAt?: number
}

export interface CreateCouponRequest {
  couponCode: string
  discountType: 'percent' | 'fixed'
  discountValue: number
  currency?: string
  validFrom: number
  validUntil: number
  maxUses: number
  minAmount?: number
}

export interface CreateCouponReply {
  coupon: Coupon
}

export interface GetCouponRequest {
  couponCode: string
}

export interface GetCouponReply {
  coupon: Coupon
}

export interface ListCouponsRequest {
  status?: string
  page?: number
  pageSize?: number
}

export interface ListCouponsReply {
  coupons: Coupon[]
  total: number
  page: number
  pageSize: number
}

export interface UpdateCouponRequest {
  couponCode: string
  discountType?: 'percent' | 'fixed'
  discountValue?: number
  currency?: string
  validFrom?: number
  validUntil?: number
  maxUses?: number
  minAmount?: number
  status?: string
}

export interface UpdateCouponReply {
  coupon: Coupon
}

export interface DeleteCouponRequest {
  couponCode: string
}

export interface ValidateCouponRequest {
  couponCode: string
  amount: number
}

export interface ValidateCouponReply {
  valid: boolean
  message: string
  discountAmount: number
  finalAmount: number
  coupon: Coupon
}

export interface UseCouponRequest {
  couponCode: string
  appId: string
  userId: number
  paymentOrderId: string
  paymentId: string
  originalAmount: number
  discountAmount: number
  finalAmount: number
}

export interface UseCouponReply {
  success: boolean
  message: string
}

export interface CouponStats {
  couponCode: string
  totalUses: number
  totalOrders: number
  totalRevenue: number
  totalDiscount: number
  conversionRate: number
}

export interface GetCouponStatsRequest {
  couponCode: string
}

export interface GetCouponStatsReply {
  couponCode: string
  totalUses: number
  totalOrders: number
  totalRevenue: number
  totalDiscount: number
  conversionRate: number
}

export interface CouponUsage {
  couponUsageId: string
  couponCode: string
  appId: string
  userId: number
  paymentOrderId: string
  paymentId: string
  originalAmount: number
  discountAmount: number
  finalAmount: number
  usedAt: number
}

export interface ListCouponUsagesRequest {
  couponCode: string
  page?: number
  pageSize?: number
}

export interface ListCouponUsagesReply {
  usages: CouponUsage[]
  total: number
  page: number
  pageSize: number
}

export interface CouponsSummaryStats {
  totalCoupons: number
  activeCoupons: number
  totalUses: number
  totalOrders: number
  totalRevenue: number
  totalDiscount: number
  averageConversionRate: number
  topCoupons: CouponStats[]
}

export interface GetCouponsSummaryStatsRequest {
  appId: string
}

export interface GetCouponsSummaryStatsReply {
  totalCoupons: number
  activeCoupons: number
  totalUses: number
  totalOrders: number
  totalRevenue: number
  totalDiscount: number
  averageConversionRate: number
  topCoupons: CouponStats[]
}
