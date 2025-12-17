/**
 * App Service - 应用管理
 */

import type { RequestClient } from '../client'
import type {
  CreateAppRequest,
  CreateAppReply,
  ListAppsRequest,
  ListAppsReply,
  GetAppReply,
  UpdateAppRequest,
  UpdateAppReply,
  DeleteAppReply,
  ApiResponse,
} from '../types'

const BASE_PATH = '/api/v1/apps'

export class AppService {
  constructor(private client: RequestClient) {}

  /**
   * 创建应用
   */
  async createApp(
    request: CreateAppRequest
  ): Promise<ApiResponse<CreateAppReply>> {
    return this.client.post<CreateAppReply>(BASE_PATH, request)
  }

  /**
   * 获取应用列表
   */
  async listApps(
    request: ListAppsRequest
  ): Promise<ApiResponse<ListAppsReply>> {
    const { user_id, ...params } = request
    return this.client.get<ListAppsReply>(BASE_PATH, {
      params: {
        user_id,
        ...params,
      },
    })
  }

  /**
   * 获取应用详情
   */
  async getApp(appId: string): Promise<ApiResponse<GetAppReply>> {
    return this.client.get<GetAppReply>(`${BASE_PATH}/${appId}`)
  }

  /**
   * 更新应用
   */
  async updateApp(
    request: UpdateAppRequest
  ): Promise<ApiResponse<UpdateAppReply>> {
    const { appId, ...data } = request
    return this.client.put<UpdateAppReply>(`${BASE_PATH}/${appId}`, data)
  }

  /**
   * 删除应用
   */
  async deleteApp(appId: string): Promise<ApiResponse<DeleteAppReply>> {
    return this.client.delete<DeleteAppReply>(`${BASE_PATH}/${appId}`)
  }
}
