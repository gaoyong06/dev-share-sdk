/**
 * Payment Service - 支付服务
 */

import type { RequestClient } from '../client'
import type {
  CreatePaymentRequest,
  CreatePaymentReply,
  GetPaymentRequest,
  GetPaymentReply,
  RefundPaymentRequest,
  RefundPaymentReply,
  RevenueStats,
  AppRevenueStats,
  ListTransactionsRequest,
  ListTransactionsReply,
  ApiResponse,
} from '../types'

const BASE_PATH = '/v1'

export class PaymentService {
  constructor(
    private client: RequestClient,
    private defaultAppId?: string
  ) {}

  /**
   * 创建支付
   */
  async createPayment(
    request: CreatePaymentRequest
  ): Promise<ApiResponse<CreatePaymentReply>> {
    return this.client.post<CreatePaymentReply>(
      `${BASE_PATH}/payment`,
      request
    )
  }

  /**
   * 获取支付信息
   */
  async getPayment(
    request: GetPaymentRequest
  ): Promise<ApiResponse<GetPaymentReply>> {
    const { paymentId, orderId } = request
    if (paymentId) {
      return this.client.get<GetPaymentReply>(
        `${BASE_PATH}/payment/${paymentId}`
      )
    }
    if (orderId) {
      return this.client.get<GetPaymentReply>(
        `${BASE_PATH}/payment/order/${orderId}`
      )
    }
    return {
      error: {
        code: 400,
        message: 'Either paymentId or orderId must be provided',
      },
    }
  }

  /**
   * 退款
   */
  async refundPayment(
    request: RefundPaymentRequest
  ): Promise<ApiResponse<RefundPaymentReply>> {
    return this.client.post<RefundPaymentReply>(
      `${BASE_PATH}/payment/refund`,
      request
    )
  }

  /**
   * 获取收入统计
   */
  async getRevenueStats(
    appId?: string
  ): Promise<ApiResponse<RevenueStats>> {
    return this.client.get<RevenueStats>(`${BASE_PATH}/revenue/stats`, {
      appId: appId || this.defaultAppId,
    })
  }

  /**
   * 获取应用收入统计
   */
  async getAppRevenueStats(
    appId?: string
  ): Promise<ApiResponse<AppRevenueStats>> {
    return this.client.get<AppRevenueStats>(`${BASE_PATH}/revenue/app`, {
      appId: appId || this.defaultAppId,
    })
  }

  /**
   * 获取交易记录列表
   */
  async listTransactions(
    params: ListTransactionsRequest,
    appId?: string
  ): Promise<ApiResponse<ListTransactionsReply>> {
    return this.client.get<ListTransactionsReply>(
      `${BASE_PATH}/transactions`,
      {
        params: params as Record<string, string | number | undefined>,
        appId: appId || this.defaultAppId,
      }
    )
  }
}
