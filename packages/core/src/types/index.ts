// API 类型定义 - 基于后端 proto 文件

// ========== 基础类型 ==========

export interface ApiError {
  code: number
  message: string
  details?: unknown
}

export type ApiResponse<T> =
  | { data: T; error?: never }
  | { data?: never; error: ApiError }

// ========== Passport Service ==========

export interface RegisterRequest {
  nickname: string
  password: string
  contactType: "phone" | "email"
  contact: string
  captcha: string
  visitorId?: string
}

export interface LoginRequest {
  contactType: "phone" | "email"
  contact: string
  password: string
  captcha?: string
}

export interface TokenResponse {
  accessToken: string    // JWT Token
  expiresIn: string      // 过期时间（Unix 时间戳字符串）
  tokenType: string      // Token 类型（通常是 "Bearer"）
}

export interface UserResponse {
  userId: string   // 用户ID（字符串UUID）
  nickname: string       // 昵称
  avatar: string         // 头像URL
  email: string          // 邮箱
  phone: string          // 手机号
  signature: string      // 个性签名
  title: string          // 职位
  isoCode: string        // ISO 国家代码
  countryName: string    // 国家名称
  provinceName: string   // 省份名称
  cityName: string       // 城市名称
  language: string       // 语言
  timezone: string       // 时区
  role: string           // 角色
  isActive: boolean      // 是否激活
  isRegistered: boolean  // 是否已注册
  createdAt: string      // 创建时间
  appId: string          // 应用ID
}

// 兼容 dev-share-web 的 UserInfo 类型
export type UserInfo = UserResponse

export interface CaptchaRequest {
  contactType: "phone" | "email"
  contact: string
  scene: "captcha_register" | "captcha_login" | "captcha_reset_password"
}

export interface ResetPasswordRequest {
  contactType: "phone" | "email"
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
  users: UserResponse[]
  total: number
  page: number
  pageSize: number
}

export interface UserStatsReply {
  totalUsers: number
  activeUsers: number
  registeredUsers: number
  newUsersToday: number
  newUsersThisMonth: number
}

// ========== Asset Service ==========

export interface UploadFileResponse {
  fileId: string
  fileName: string
  fileSize: number
  mimeType: string
}

export interface FileInfo {
  fileId: string
  fileName: string
  fileSize: number
  mimeType: string
  businessType: string
  source: string
  createdAt: string
}

export interface GetFileInfoReply {
  file: FileInfo
}

export interface GetFileURLReply {
  url: string
  expireSeconds: number
}

export interface DeleteFileReply {
  success: boolean
}

export interface ListFilesReply {
  files: FileInfo[]
  total: number
  page: number
  pageSize: number
}

// ========== Notification Service ==========

export interface SendNotificationRequest {
  channel: "sms" | "email" | "push" | "inapp"
  recipient: string
  templateId?: string
  scene?: string
  params?: Record<string, string>
  locale?: string
}

export interface SendNotificationResponse {
  notificationId: string
  status: "sent" | "pending" | "failed"
}

// ========== Subscription Service ==========

export interface CreateSubscriptionRequest {
  planId: string
  userId: string
}

export interface Subscription {
  subscriptionId: string
  userId: string
  planId: string
  status: "active" | "cancelled" | "expired"
  startDate: string
  endDate: string
}

export interface CreateSubscriptionResponse {
  subscription: Subscription
}

// ========== Billing Service ==========

export interface FreeQuota {
  serviceName: string
  totalQuota: number
  usedQuota: number
  resetMonth: string
}

export interface GetAccountReply {
  userId: string
  balance: number
  quotas: FreeQuota[]
}

export interface RechargeRequest {
  userId: string
  amount: number
  paymentMethod: "wechat" | "alipay"
}

export interface RechargeReply {
  rechargeOrderId: string
  paymentUrl: string
}

