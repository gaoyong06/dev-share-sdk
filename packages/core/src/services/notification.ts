// Notification Service API

import { RequestClient } from '../client/request'
import type {
  SendNotificationRequest,
  SendNotificationResponse,
  ApiResponse,
} from '../types'

const BASE_PATH = '/api/v1/notifications'

export class NotificationService {
  private client: RequestClient

  constructor(client: RequestClient) {
    this.client = client
  }

  /**
   * 发送通知
   */
  async send(request: SendNotificationRequest, appId?: string): Promise<ApiResponse<SendNotificationResponse>> {
    return this.client.post<SendNotificationResponse>(BASE_PATH, request, {
      appId,
    })
  }
}

