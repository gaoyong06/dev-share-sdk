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
  GetOrEnsureMySubscriptionRequest,
  GetOrEnsureMySubscriptionReply,
  EnsureDefaultFreeSubscriptionRequest,
  EnsureDefaultFreeSubscriptionReply,
  CancelSubscriptionRequest,
  PauseSubscriptionRequest,
  ResumeSubscriptionRequest,
  GetSubscriptionHistoryRequest,
  GetSubscriptionHistoryReply,
  SetAutoRenewRequest,
  ApiResponse,
} from '../types'

const BASE_PATH = '/subscription/v1'

export class SubscriptionService {
  constructor(private client: RequestClient) {}

  /**
   * 获取套餐列表
   */
  async listPlans(appId: string): Promise<ApiResponse<ListPlansReply>> {
    return this.client.get<ListPlansReply>(`${BASE_PATH}/plans`, {
      appId,
    })
  }

  /**
   * 创建套餐（请求体须含 appId）
   */
  async createPlan(
    request: CreatePlanRequest
  ): Promise<ApiResponse<CreatePlanReply>> {
    return this.client.post<CreatePlanReply>(`${BASE_PATH}/plans`, request, {
      appId: request.appId,
    })
  }

  /**
   * 更新套餐
   */
  async updatePlan(
    request: UpdatePlanRequest,
    appId: string
  ): Promise<ApiResponse<UpdatePlanReply>> {
    const { planId, ...data } = request
    return this.client.put<UpdatePlanReply>(
      `${BASE_PATH}/plans/${planId}`,
      data,
      { appId }
    )
  }

  /**
   * 删除套餐
   */
  async deletePlan(
    planId: string,
    appId: string
  ): Promise<ApiResponse<DeletePlanReply>> {
    return this.client.delete<DeletePlanReply>(`${BASE_PATH}/plans/${planId}`, {
      appId,
    })
  }

  /**
   * 获取套餐区域定价列表
   */
  async listPlanPricings(
    planId: string,
    appId: string
  ): Promise<ApiResponse<ListPlanPricingsReply>> {
    return this.client.get<ListPlanPricingsReply>(
      `${BASE_PATH}/plans/${planId}/pricings`,
      { appId }
    )
  }

  /**
   * 创建区域定价
   */
  async createPlanPricing(
    request: CreatePlanPricingRequest,
    appId: string
  ): Promise<ApiResponse<CreatePlanPricingReply>> {
    const { planId, ...data } = request
    return this.client.post<CreatePlanPricingReply>(
      `${BASE_PATH}/plans/${planId}/pricings`,
      data,
      { appId }
    )
  }

  /**
   * 更新区域定价
   */
  async updatePlanPricing(
    request: UpdatePlanPricingRequest,
    appId: string
  ): Promise<ApiResponse<UpdatePlanPricingReply>> {
    const { planPricingId, ...data } = request
    return this.client.put<UpdatePlanPricingReply>(
      `${BASE_PATH}/pricings/${planPricingId}`,
      data,
      { appId }
    )
  }

  /**
   * 删除区域定价
   */
  async deletePlanPricing(
    planPricingId: number,
    appId: string
  ): Promise<ApiResponse<DeletePlanPricingReply>> {
    return this.client.delete<DeletePlanPricingReply>(
      `${BASE_PATH}/pricings/${planPricingId}`,
      { appId }
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
   * 获取（并必要时初始化）我的订阅 —— 推荐唯一入口；首次可能写入默认免费档
   */
  async getOrEnsureMySubscription(
    request: GetOrEnsureMySubscriptionRequest
  ): Promise<ApiResponse<GetOrEnsureMySubscriptionReply>> {
    const { userId } = request
    return this.client.get<GetOrEnsureMySubscriptionReply>(
      `${BASE_PATH}/my/${userId}`
    )
  }

  /**
   * 幂等写入默认免费档订阅（服务端无记录时创建）
   */
  async ensureDefaultFreeSubscription(
    request: EnsureDefaultFreeSubscriptionRequest
  ): Promise<ApiResponse<EnsureDefaultFreeSubscriptionReply>> {
    return this.client.post<EnsureDefaultFreeSubscriptionReply>(
      `${BASE_PATH}/my/ensure-free`,
      request
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
