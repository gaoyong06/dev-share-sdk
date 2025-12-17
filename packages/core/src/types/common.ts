/**
 * 通用类型定义
 */

export interface ApiError {
  code: number
  message: string
  details?: unknown
}

export interface ApiResponse<T> {
  data?: T
  error?: ApiError
}

// UserCacheConfig 需要 UserInfo，但为了避免循环依赖，使用泛型
export interface UserCacheConfig<T = any> {
  tokenGetter?: () => string | null
  userGetter?: () => string | null
  userIdGetter?: () => string | null
  userSetter?: (user: T) => void
  userIdSetter?: (userId: string) => void
  clearCache?: () => void
}
