/**
 * Passport Service 类型定义
 */

export interface RegisterRequest {
  nickname: string
  password: string
  contactType: 'phone' | 'email'
  contact: string
  captcha: string
  visitorId?: string
}

export interface LoginRequest {
  contactType: 'phone' | 'email'
  contact: string
  password: string
  captcha?: string
}

export interface TokenResponse {
  accessToken: string
  expiresIn: string | number
  tokenType: string
}

export interface UserResponse {
  userId: string
  nickname: string
  avatar: string
  email: string
  phone: string
  signature: string
  title: string
  isoCode: string
  countryName: string
  provinceName: string
  cityName: string
  language: string
  timezone: string
  role: string
  isActive: boolean
  isRegistered: boolean
  isBlacklisted?: boolean
  blacklistedAt?: string
  blacklistedReason?: string
  createdAt: string
  appId: string
}

export type UserInfo = UserResponse

export interface CaptchaRequest {
  contactType: 'phone' | 'email'
  contact: string
  scene: 'captcha_register' | 'captcha_login' | 'captcha_reset_password'
}

export interface ResetPasswordRequest {
  contactType: 'phone' | 'email'
  contact: string
  captcha: string
  newPassword: string
}

export interface ValidateTokenRequest {
  token: string
}

export interface UserClaims {
  userId: string
  role: string
}

export interface UpdateProfileRequest {
  userId: string
  nickname?: string
  avatar?: string
  signature?: string
  title?: string
  isoCode?: string
  countryName?: string
  provinceName?: string
  cityName?: string
  language?: string
  timezone?: string
}

export interface ListUsersRequest {
  page?: number
  pageSize?: number
  search?: string
}

export interface ListUsersReply {
  users: UserInfo[]
  total: number
  page: number
  pageSize: number
}

export interface UserStatsReply {
  totalUsers: number
  monthlyActiveUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
}

export interface BatchGetUserRequest {
  userIds: string[]
}

export interface BatchUserResponse {
  users: Record<string, UserResponse>
}

export interface LogoutRequest {
  token: string
}

export interface CreateGuestRequest {
  visitorId?: string
}

export interface GuestResponse {
  accessToken: string
  expiresIn: number
  tokenType: string
  user: UserResponse
}

export interface UpdateUserStatusRequest {
  userId: string
  isActive: boolean
}

export interface AddToBlacklistRequest {
  userId: string
  reason?: string
}

export interface RemoveFromBlacklistRequest {
  userId: string
}

export interface BatchAddToBlacklistRequest {
  userIds: string[]
  reason?: string
}

export interface BatchAddToBlacklistReply {
  successCount: number
  totalCount: number
}

export interface GetLocationByIPRequest {
  ip: string
}

export interface LocationResponse {
  ip: string
  isoCode: string
  country: string
  province: string
  city: string
  postal: string
  timezone: string
  latitude: number
  longitude: number
}
