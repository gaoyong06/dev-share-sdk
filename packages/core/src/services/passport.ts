/**
 * Passport Service - 用户认证、注册、登录
 */

import type { RequestClient } from '../client'
import type {
  RegisterRequest,
  LoginRequest,
  TokenResponse,
  UserInfo,
  UserResponse,
  CaptchaRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  ListUsersRequest,
  ListUsersReply,
  UserStatsReply,
  BatchGetUserRequest,
  BatchUserResponse,
  LogoutRequest,
  CreateGuestRequest,
  GuestResponse,
  UpdateUserStatusRequest,
  AddToBlacklistRequest,
  RemoveFromBlacklistRequest,
  BatchAddToBlacklistRequest,
  BatchAddToBlacklistReply,
  GetLocationByIPRequest,
  LocationResponse,
  ApiResponse,
} from '../types'

const BASE_PATH = '/v1'

export class PassportService {
  constructor(
    private client: RequestClient,
    private defaultAppId?: string
  ) {}

  /**
   * 注册
   */
  async register(
    request: RegisterRequest,
    appId?: string
  ): Promise<ApiResponse<UserResponse>> {
    return this.client.post<UserResponse>(
      `${BASE_PATH}/auth/register`,
      request,
      { appId: appId || this.defaultAppId }
    )
  }

  /**
   * 登录
   */
  async login(
    request: LoginRequest,
    appId?: string
  ): Promise<ApiResponse<TokenResponse>> {
    return this.client.post<TokenResponse>(
      `${BASE_PATH}/auth/login`,
      request,
      { appId: appId || this.defaultAppId }
    )
  }

  /**
   * 登出
   */
  async logout(request: LogoutRequest): Promise<ApiResponse<void>> {
    return this.client.post<void>(`${BASE_PATH}/auth/logout`, request)
  }

  /**
   * 发送验证码
   */
  async sendCaptcha(
    request: CaptchaRequest,
    appId?: string
  ): Promise<ApiResponse<void>> {
    return this.client.post<void>(
      `${BASE_PATH}/auth/captcha`,
      request,
      { appId: appId || this.defaultAppId }
    )
  }

  /**
   * 验证验证码
   */
  async verifyCaptcha(
    request: CaptchaRequest
  ): Promise<ApiResponse<void>> {
    return this.client.post<void>(
      `${BASE_PATH}/auth/captcha/verify`,
      request
    )
  }

  /**
   * 重置密码
   */
  async resetPassword(
    request: ResetPasswordRequest
  ): Promise<ApiResponse<void>> {
    return this.client.post<void>(
      `${BASE_PATH}/auth/password/reset`,
      request
    )
  }

  /**
   * 验证 Token
   */
  async validateToken(token: string): Promise<ApiResponse<UserResponse>> {
    return this.client.post<UserResponse>(
      `${BASE_PATH}/auth/token/validate`,
      { token }
    )
  }

  /**
   * 创建访客账号
   */
  async createGuest(
    request: CreateGuestRequest,
    appId?: string
  ): Promise<ApiResponse<GuestResponse>> {
    return this.client.post<GuestResponse>(
      `${BASE_PATH}/auth/guest`,
      request,
      { appId: appId || this.defaultAppId }
    )
  }

  /**
   * 获取用户详情
   */
  async getUser(userId: string): Promise<ApiResponse<UserInfo>> {
    return this.client.get<UserInfo>(`${BASE_PATH}/users/${userId}`)
  }

  /**
   * 批量获取用户
   */
  async batchGetUsers(
    request: BatchGetUserRequest
  ): Promise<ApiResponse<BatchUserResponse>> {
    return this.client.post<BatchUserResponse>(
      `${BASE_PATH}/users/batch`,
      request
    )
  }

  /**
   * 获取用户列表
   */
  async listUsers(
    params: ListUsersRequest,
    appId?: string
  ): Promise<ApiResponse<ListUsersReply>> {
    return this.client.get<ListUsersReply>(`${BASE_PATH}/users`, {
      params: {
        ...params,
      },
      appId: appId || this.defaultAppId,
    })
  }

  /**
   * 获取用户统计
   */
  async getUserStats(
    appId?: string
  ): Promise<ApiResponse<UserStatsReply>> {
    return this.client.get<UserStatsReply>(`${BASE_PATH}/users/stats`, {
      appId: appId || this.defaultAppId,
    })
  }

  /**
   * 更新用户资料
   */
  async updateProfile(
    request: UpdateProfileRequest
  ): Promise<ApiResponse<UserInfo>> {
    const { userId, ...data } = request
    return this.client.put<UserInfo>(`${BASE_PATH}/users/${userId}`, data)
  }

  /**
   * 更新用户状态
   */
  async updateUserStatus(
    request: UpdateUserStatusRequest
  ): Promise<ApiResponse<UserInfo>> {
    const { userId, ...data } = request
    return this.client.put<UserInfo>(
      `${BASE_PATH}/users/${userId}/status`,
      data
    )
  }

  /**
   * 加入黑名单
   */
  async addToBlacklist(
    request: AddToBlacklistRequest,
    appId?: string
  ): Promise<ApiResponse<UserInfo>> {
    const { userId, ...data } = request
    return this.client.post<UserInfo>(
      `${BASE_PATH}/users/${userId}/blacklist`,
      data,
      { appId: appId || this.defaultAppId }
    )
  }

  /**
   * 移出黑名单
   */
  async removeFromBlacklist(
    userId: string,
    appId?: string
  ): Promise<ApiResponse<UserInfo>> {
    return this.client.delete<UserInfo>(
      `${BASE_PATH}/users/${userId}/blacklist`,
      { appId: appId || this.defaultAppId }
    )
  }

  /**
   * 批量加入黑名单
   */
  async batchAddToBlacklist(
    request: BatchAddToBlacklistRequest,
    appId?: string
  ): Promise<ApiResponse<BatchAddToBlacklistReply>> {
    return this.client.post<BatchAddToBlacklistReply>(
      `${BASE_PATH}/users/blacklist/batch`,
      request,
      { appId: appId || this.defaultAppId }
    )
  }

  /**
   * 根据 IP 获取地理位置
   */
  async getLocationByIP(
    request: GetLocationByIPRequest
  ): Promise<ApiResponse<LocationResponse>> {
    return this.client.post<LocationResponse>(
      `${BASE_PATH}/geoip/location`,
      request
    )
  }
}
