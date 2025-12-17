/**
 * Notification Service - 通知发送
 */

import type { RequestClient } from '../client'
import type {
  SendNotificationRequest,
  SendNotificationReply,
  BatchSendRequest,
  BatchSendReply,
  GetStatusReply,
  GetHistoryReply,
  SaveTemplateRequest,
  SaveTemplateReply,
  ListTemplatesRequest,
  ListTemplatesReply,
  SetUserPreferenceRequest,
  SetUserPreferenceReply,
  GetUserPreferenceReply,
  ApiResponse,
} from '../types'

const BASE_PATH = '/v1/notification'

export class NotificationService {
  constructor(private client: RequestClient) {}

  /**
   * 发送通知
   */
  async send(
    request: SendNotificationRequest
  ): Promise<ApiResponse<SendNotificationReply>> {
    return this.client.post<SendNotificationReply>(
      `${BASE_PATH}/send`,
      request
    )
  }

  /**
   * 批量发送通知
   */
  async batchSend(
    request: BatchSendRequest
  ): Promise<ApiResponse<BatchSendReply>> {
    return this.client.post<BatchSendReply>(
      `${BASE_PATH}/batch-send`,
      request
    )
  }

  /**
   * 获取通知状态
   */
  async getStatus(
    notificationId: string
  ): Promise<ApiResponse<GetStatusReply>> {
    return this.client.get<GetStatusReply>(
      `${BASE_PATH}/status/${notificationId}`
    )
  }

  /**
   * 获取通知历史
   */
  async getHistory(
    userId: string,
    params?: {
      channels?: string[]
      startTime?: number
      endTime?: number
      page?: number
      pageSize?: number
    }
  ): Promise<ApiResponse<GetHistoryReply>> {
    return this.client.get<GetHistoryReply>(
      `${BASE_PATH}/history/${userId}`,
      {
        params: params as Record<string, string | number | undefined>,
      }
    )
  }

  /**
   * 保存模板（创建或更新）
   */
  async saveTemplate(
    request: SaveTemplateRequest
  ): Promise<ApiResponse<SaveTemplateReply>> {
    return this.client.post<SaveTemplateReply>(
      `${BASE_PATH}/template`,
      request
    )
  }

  /**
   * 列出模板
   */
  async listTemplates(
    request?: ListTemplatesRequest
  ): Promise<ApiResponse<ListTemplatesReply>> {
    return this.client.get<ListTemplatesReply>(
      `${BASE_PATH}/templates`,
      {
        params: request as Record<string, string | number | undefined>,
      }
    )
  }

  /**
   * 设置用户偏好
   */
  async setUserPreference(
    request: SetUserPreferenceRequest
  ): Promise<ApiResponse<SetUserPreferenceReply>> {
    return this.client.post<SetUserPreferenceReply>(
      `${BASE_PATH}/preference`,
      request
    )
  }

  /**
   * 获取用户偏好
   */
  async getUserPreference(
    userId: string
  ): Promise<ApiResponse<GetUserPreferenceReply>> {
    return this.client.get<GetUserPreferenceReply>(
      `${BASE_PATH}/preference/${userId}`
    )
  }
}
