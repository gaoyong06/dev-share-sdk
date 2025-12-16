// Billing Service API

import { RequestClient } from '../client/request'
import type {
  GetAccountReply,
  RechargeRequest,
  RechargeReply,
  ApiResponse,
} from '../types'

const BASE_PATH = '/api/v1/billing'

export class BillingService {
  private client: RequestClient

  constructor(client: RequestClient) {
    this.client = client
  }

  /**
   * 获取账户信息
   */
  async getAccount(userId: string): Promise<ApiResponse<GetAccountReply>> {
    return this.client.get<GetAccountReply>(`${BASE_PATH}/account/${userId}`)
  }

  /**
   * 充值
   */
  async recharge(request: RechargeRequest): Promise<ApiResponse<RechargeReply>> {
    return this.client.post<RechargeReply>(`${BASE_PATH}/recharge`, request)
  }
}

