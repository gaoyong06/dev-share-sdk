// Passport Service API

import { RequestClient } from '../client/request'
import type {
  RegisterRequest,
  LoginRequest,
  TokenResponse,
  UserResponse,
  UserInfo,
  CaptchaRequest,
  ResetPasswordRequest,
  ValidateTokenRequest,
  UserClaims,
  UpdateProfileRequest,
  ListUsersRequest,
  ListUsersReply,
  UserStatsReply,
  ApiResponse,
} from '../types'

const BASE_PATH = '/v1'

export class PassportService {
  private client: RequestClient
  private defaultAppId?: string

  constructor(client: RequestClient, defaultAppId?: string) {
    this.client = client
    this.defaultAppId = defaultAppId
  }

  /**
   * 用户登录
   */
  async login(request: LoginRequest, appId?: string): Promise<ApiResponse<TokenResponse>> {
    return this.client.post<TokenResponse>(`${BASE_PATH}/auth/login`, request, {
      appId: appId || this.defaultAppId,
    })
  }

  /**
   * 用户注册
   */
  async register(request: RegisterRequest, appId?: string): Promise<ApiResponse<UserInfo>> {
    return this.client.post<UserInfo>(`${BASE_PATH}/auth/register`, request, {
      appId: appId || this.defaultAppId,
    })
  }

  /**
   * 发送验证码
   */
  async sendCaptcha(request: CaptchaRequest, appId?: string): Promise<ApiResponse<void>> {
    return this.client.post<void>(`${BASE_PATH}/auth/captcha`, request, {
      appId: appId || this.defaultAppId,
    })
  }

  /**
   * 重置密码
   */
  async resetPassword(request: ResetPasswordRequest, appId?: string): Promise<ApiResponse<void>> {
    return this.client.post<void>(`${BASE_PATH}/auth/reset-password`, request, {
      appId: appId || this.defaultAppId,
    })
  }

  /**
   * 验证 Token（可选，用于验证 token 有效性）
   * 注意：这个 API 可能需要后端实现，或者前端直接解析 JWT
   */
  async validateToken(token: string): Promise<ApiResponse<UserClaims>> {
    return this.client.post<UserClaims>(`${BASE_PATH}/auth/validate-token`, { token })
  }

  /**
   * 获取用户详情
   */
  async getUser(userId: string): Promise<ApiResponse<UserInfo>> {
    return this.client.get<UserInfo>(`${BASE_PATH}/users/${userId}`)
  }

  /**
   * 获取用户列表
   */
  async listUsers(params: ListUsersRequest, appId: string): Promise<ApiResponse<ListUsersReply>> {
    const { page = 1, pageSize = 20, search } = params
    return this.client.get<ListUsersReply>(`${BASE_PATH}/users`, {
      params: {
        appId,
        page,
        pageSize,
        ...(search && { search }),
      },
    })
  }

  /**
   * 获取用户统计
   */
  async getUserStats(appId: string): Promise<ApiResponse<UserStatsReply>> {
    return this.client.get<UserStatsReply>(`${BASE_PATH}/users/stats`, {
      params: {
        appId,
      },
    })
  }

  /**
   * 更新用户状态
   */
  async updateUserStatus(userId: string, isActive: boolean): Promise<ApiResponse<UserInfo>> {
    return this.client.put<UserInfo>(`${BASE_PATH}/users/${userId}/status`, {
      isActive,
    })
  }

  /**
   * 更新用户资料
   */
  async updateProfile(request: UpdateProfileRequest): Promise<ApiResponse<UserInfo>> {
    const { userId, ...data } = request
    return this.client.put<UserInfo>(`${BASE_PATH}/users/${userId}`, data)
  }

  /**
   * 加入黑名单
   */
  async addToBlacklist(userId: string, reason: string, appId: string): Promise<ApiResponse<UserInfo>> {
    return this.client.post<UserInfo>(`${BASE_PATH}/users/${userId}/blacklist`, {
      reason: reason || '',
    }, {
      appId,
    })
  }

  /**
   * 移出黑名单
   */
  async removeFromBlacklist(userId: string, appId: string): Promise<ApiResponse<UserInfo>> {
    return this.client.delete<UserInfo>(`${BASE_PATH}/users/${userId}/blacklist`, {
      appId,
    })
  }

  /**
   * 批量加入黑名单
   */
  async batchAddToBlacklist(
    userIds: string[],
    reason: string,
    appId: string
  ): Promise<ApiResponse<{ successCount: number; totalCount: number }>> {
    return this.client.post<{ successCount: number; totalCount: number }>(
      `${BASE_PATH}/users/blacklist/batch`,
      {
        userIds,
        reason: reason || '',
      },
      {
        appId,
      }
    )
  }
}

