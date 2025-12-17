/**
 * Marketing Service - 营销服务
 */

import type { RequestClient } from '../client'
import type {
  Coupon,
  CreateCouponRequest,
  CreateCouponReply,
  GetCouponRequest,
  GetCouponReply,
  ListCouponsRequest,
  ListCouponsReply,
  UpdateCouponRequest,
  UpdateCouponReply,
  DeleteCouponRequest,
  ValidateCouponRequest,
  ValidateCouponReply,
  UseCouponRequest,
  UseCouponReply,
  GetCouponStatsRequest,
  GetCouponStatsReply,
  ListCouponUsagesRequest,
  ListCouponUsagesReply,
  GetCouponsSummaryStatsRequest,
  GetCouponsSummaryStatsReply,
  ApiResponse,
} from '../types'

const BASE_PATH = '/v1'

export class MarketingService {
  constructor(private client: RequestClient) {}

  /**
   * 创建优惠券
   */
  async createCoupon(
    request: CreateCouponRequest,
    appId?: string
  ): Promise<ApiResponse<CreateCouponReply>> {
    return this.client.post<CreateCouponReply>(
      `${BASE_PATH}/coupons`,
      request,
      { appId }
    )
  }

  /**
   * 获取优惠券
   */
  async getCoupon(
    request: GetCouponRequest
  ): Promise<ApiResponse<GetCouponReply>> {
    const { couponCode } = request
    return this.client.get<GetCouponReply>(
      `${BASE_PATH}/coupons/${couponCode}`
    )
  }

  /**
   * 列出优惠券
   */
  async listCoupons(
    params: ListCouponsRequest,
    appId?: string
  ): Promise<ApiResponse<ListCouponsReply>> {
    return this.client.get<ListCouponsReply>(`${BASE_PATH}/coupons`, {
      params: params as Record<string, string | number | undefined>,
      appId,
    })
  }

  /**
   * 更新优惠券
   */
  async updateCoupon(
    request: UpdateCouponRequest
  ): Promise<ApiResponse<UpdateCouponReply>> {
    const { couponCode, ...data } = request
    return this.client.put<UpdateCouponReply>(
      `${BASE_PATH}/coupons/${couponCode}`,
      data
    )
  }

  /**
   * 删除优惠券
   */
  async deleteCoupon(
    request: DeleteCouponRequest
  ): Promise<ApiResponse<void>> {
    const { couponCode } = request
    return this.client.delete<void>(`${BASE_PATH}/coupons/${couponCode}`)
  }

  /**
   * 验证优惠券
   */
  async validateCoupon(
    request: ValidateCouponRequest
  ): Promise<ApiResponse<ValidateCouponReply>> {
    return this.client.post<ValidateCouponReply>(
      `${BASE_PATH}/coupons/validate`,
      request
    )
  }

  /**
   * 使用优惠券
   */
  async useCoupon(
    request: UseCouponRequest
  ): Promise<ApiResponse<UseCouponReply>> {
    return this.client.post<UseCouponReply>(
      `${BASE_PATH}/coupons/use`,
      request
    )
  }

  /**
   * 获取优惠券统计
   */
  async getCouponStats(
    request: GetCouponStatsRequest
  ): Promise<ApiResponse<GetCouponStatsReply>> {
    const { couponCode } = request
    return this.client.get<GetCouponStatsReply>(
      `${BASE_PATH}/coupons/${couponCode}/stats`
    )
  }

  /**
   * 获取优惠券使用记录
   */
  async listCouponUsages(
    request: ListCouponUsagesRequest
  ): Promise<ApiResponse<ListCouponUsagesReply>> {
    const { couponCode, ...params } = request
    return this.client.get<ListCouponUsagesReply>(
      `${BASE_PATH}/coupons/${couponCode}/usages`,
      {
        params: params as Record<string, number | undefined>,
      }
    )
  }

  /**
   * 获取所有优惠券汇总统计
   */
  async getCouponsSummaryStats(
    request: GetCouponsSummaryStatsRequest
  ): Promise<ApiResponse<GetCouponsSummaryStatsReply>> {
    const { appId } = request
    return this.client.get<GetCouponsSummaryStatsReply>(
      `${BASE_PATH}/coupons/summary-stats`,
      {
        appId,
      }
    )
  }
}
