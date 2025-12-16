// Subscription Service API

import { RequestClient } from '../client/request'
import type {
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  Subscription,
  ApiResponse,
} from '../types'

const BASE_PATH = '/api/v1/subscriptions'

export class SubscriptionService {
  private client: RequestClient

  constructor(client: RequestClient) {
    this.client = client
  }

  /**
   * 创建订阅
   */
  async create(request: CreateSubscriptionRequest, appId?: string): Promise<ApiResponse<CreateSubscriptionResponse>> {
    return this.client.post<CreateSubscriptionResponse>(BASE_PATH, request, {
      appId,
    })
  }

  /**
   * 获取订阅详情
   */
  async get(subscriptionId: string): Promise<ApiResponse<Subscription>> {
    return this.client.get<Subscription>(`${BASE_PATH}/${subscriptionId}`)
  }

  /**
   * 取消订阅
   */
  async cancel(subscriptionId: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`${BASE_PATH}/${subscriptionId}`)
  }
}

