/**
 * Subscription Service - 订阅管理
 */

import type { RequestClient } from '../client'
import type {
  ListPlansReply,
  CreatePlanRequest,
  CreatePlanReply,
  UpdatePlanRequest,
  UpdatePlanReply,
  DeletePlanReply,
  ListPlanPricingsReply,
  CreatePlanPricingRequest,
  CreatePlanPricingReply,
  UpdatePlanPricingRequest,
  UpdatePlanPricingReply,
  DeletePlanPricingReply,
  CreateSubscriptionOrderRequest,
  CreateSubscriptionOrderReply,
  ListSubscriptionOrdersRequest,
  ListSubscriptionOrdersReply,
  GetSubscriptionOrderRequest,
  GetSubscriptionOrderReply,
  ListAppSubscriptionsRequest,
  ListAppSubscriptionsReply,
  GetAppSubscriptionHistoryRequest,
  GetAppSubscriptionHistoryReply,
  GetMySubscriptionRequest,
  GetMySubscriptionReply,
  CancelSubscriptionRequest,
  PauseSubscriptionRequest,
  ResumeSubscriptionRequest,
  GetSubscriptionHistoryRequest,
  GetSubscriptionHistoryReply,
  SetAutoRenewRequest,
  ApiResponse,
} from '../types'

const BASE_PATH = '/v1/subscription'

export class SubscriptionService {
  constructor(private client: RequestClient) {}

  /**
   * 获取套餐列表
   */
  async listPlans(appId?: string): Promise<ApiResponse<ListPlansReply>> {
    return this.client.get<ListPlansReply>(`${BASE_PATH}/plans`, {
      appId,
    })
  }

  /**
   * 创建套餐
   */
  async createPlan(
    request: CreatePlanRequest,
    appId?: string
  ): Promise<ApiResponse<CreatePlanReply>> {
    return this.client.post<CreatePlanReply>(
      `${BASE_PATH}/plans`,
      request,
      { appId }
    )
  }

  /**
   * 更新套餐
   */
  async updatePlan(
    request: UpdatePlanRequest
  ): Promise<ApiResponse<UpdatePlanReply>> {
    const { planId, ...data } = request
    return this.client.put<UpdatePlanReply>(
      `${BASE_PATH}/plans/${planId}`,
      data
    )
  }

  /**
   * 删除套餐
   */
  async deletePlan(planId: string): Promise<ApiResponse<DeletePlanReply>> {
    return this.client.delete<DeletePlanReply>(
      `${BASE_PATH}/plans/${planId}`
    )
  }

  /**
   * 获取套餐区域定价列表
   */
  async listPlanPricings(
    planId: string
  ): Promise<ApiResponse<ListPlanPricingsReply>> {
    return this.client.get<ListPlanPricingsReply>(
      `${BASE_PATH}/plans/${planId}/pricings`
    )
  }

  /**
   * 创建区域定价
   */
  async createPlanPricing(
    request: CreatePlanPricingRequest
  ): Promise<ApiResponse<CreatePlanPricingReply>> {
    const { planId, ...data } = request
    return this.client.post<CreatePlanPricingReply>(
      `${BASE_PATH}/plans/${planId}/pricings`,
      data
    )
  }

  /**
   * 更新区域定价
   */
  async updatePlanPricing(
    request: UpdatePlanPricingRequest
  ): Promise<ApiResponse<UpdatePlanPricingReply>> {
    const { planPricingId, ...data } = request
    return this.client.put<UpdatePlanPricingReply>(
      `${BASE_PATH}/pricings/${planPricingId}`,
      data
    )
  }

  /**
   * 删除区域定价
   */
  async deletePlanPricing(
    planPricingId: number
  ): Promise<ApiResponse<DeletePlanPricingReply>> {
    return this.client.delete<DeletePlanPricingReply>(
      `${BASE_PATH}/pricings/${planPricingId}`
    )
  }

  /**
   * 创建订阅订单
   */
  async createSubscriptionOrder(
    request: CreateSubscriptionOrderRequest
  ): Promise<ApiResponse<CreateSubscriptionOrderReply>> {
    const { region, ...data } = request
    return this.client.post<CreateSubscriptionOrderReply>(
      `${BASE_PATH}/order`,
      data
    )
  }

  /**
   * 获取我的订阅
   */
  async getMySubscription(
    request: GetMySubscriptionRequest
  ): Promise<ApiResponse<GetMySubscriptionReply>> {
    const { userId } = request
    return this.client.get<GetMySubscriptionReply>(
      `${BASE_PATH}/my/${userId}`
    )
  }

  /**
   * 取消订阅
   */
  async cancelSubscription(
    request: CancelSubscriptionRequest
  ): Promise<ApiResponse<void>> {
    return this.client.post<void>(`${BASE_PATH}/cancel`, request)
  }

  /**
   * 暂停订阅
   */
  async pauseSubscription(
    request: PauseSubscriptionRequest
  ): Promise<ApiResponse<void>> {
    return this.client.post<void>(`${BASE_PATH}/pause`, request)
  }

  /**
   * 恢复订阅
   */
  async resumeSubscription(
    request: ResumeSubscriptionRequest
  ): Promise<ApiResponse<void>> {
    return this.client.post<void>(`${BASE_PATH}/resume`, request)
  }

  /**
   * 获取订阅历史
   */
  async getSubscriptionHistory(
    request: GetSubscriptionHistoryRequest
  ): Promise<ApiResponse<GetSubscriptionHistoryReply>> {
    const { userId, ...params } = request
    return this.client.get<GetSubscriptionHistoryReply>(
      `${BASE_PATH}/history/${userId}`,
      {
        params: params as Record<string, number | undefined>,
      }
    )
  }

  /**
   * 设置自动续费
   */
  async setAutoRenew(
    request: SetAutoRenewRequest
  ): Promise<ApiResponse<void>> {
    return this.client.post<void>(`${BASE_PATH}/auto-renew`, request)
  }

  /**
   * 获取订阅订单列表（管理员视角）
   */
  async listSubscriptionOrders(
    request: ListSubscriptionOrdersRequest
  ): Promise<ApiResponse<ListSubscriptionOrdersReply>> {
    const { appId, ...params } = request
    return this.client.get<ListSubscriptionOrdersReply>(
      `${BASE_PATH}/orders`,
      {
        params: params as Record<string, string | number | undefined>,
        appId,
      }
    )
  }

  /**
   * 获取订阅订单详情
   */
  async getSubscriptionOrder(
    request: GetSubscriptionOrderRequest
  ): Promise<ApiResponse<GetSubscriptionOrderReply>> {
    const { orderId } = request
    return this.client.get<GetSubscriptionOrderReply>(
      `${BASE_PATH}/orders/${orderId}`
    )
  }

  /**
   * 获取应用的订阅用户列表（管理员视角）
   */
  async listAppSubscriptions(
    request: ListAppSubscriptionsRequest
  ): Promise<ApiResponse<ListAppSubscriptionsReply>> {
    const { appId, ...params } = request
    return this.client.get<ListAppSubscriptionsReply>(
      `${BASE_PATH}/app/subscriptions`,
      {
        params: params as Record<string, string | number | undefined>,
        appId,
      }
    )
  }

  /**
   * 获取应用的订阅历史记录（管理员视角）
   */
  async getAppSubscriptionHistory(
    request: GetAppSubscriptionHistoryRequest
  ): Promise<ApiResponse<GetAppSubscriptionHistoryReply>> {
    const { appId, ...params } = request
    return this.client.get<GetAppSubscriptionHistoryReply>(
      `${BASE_PATH}/app/history`,
      {
        params: params as Record<string, string | number | undefined>,
        appId,
      }
    )
  }
}
