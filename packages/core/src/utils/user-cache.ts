/**
 * 用户缓存管理工具
 * 处理用户信息的缓存验证和清理逻辑
 */

import { getUserIdFromToken } from './jwt'
import type { UserInfo } from '../types/passport'

export interface UserCacheConfig {
  tokenGetter?: () => string | null
  userGetter?: () => string | null
  userIdGetter?: () => string | null
  userSetter?: (user: UserInfo) => void
  userIdSetter?: (userId: string) => void
  clearCache?: () => void
}

/**
 * 验证并获取缓存的用户信息
 * 如果 token 中的 userId 与缓存不匹配，会清理缓存
 * @param config 缓存配置（可选）
 * @returns 验证后的用户信息或 null
 */
export function validateAndGetCachedUser(config?: UserCacheConfig): UserInfo | null {
  if (typeof window === 'undefined') {
    return null
  }

  const getToken = config?.tokenGetter || (() => localStorage.getItem('access_token'))
  const getUser = config?.userGetter || (() => localStorage.getItem('user'))
  const getUserId = config?.userIdGetter || (() => localStorage.getItem('user_id'))
  const clearCache = config?.clearCache || (() => {
    localStorage.removeItem('user')
    localStorage.removeItem('user_id')
  })

  const token = getToken()
  
  // 没有 token，清理所有缓存
  if (!token) {
    clearCache()
    return null
  }

  // 从 token 中解析 userId
  const userIdFromToken = getUserIdFromToken(getToken)
  const savedUser = getUser()
  const savedUserId = getUserId()

  // 如果 token 中无法解析 userId，或者缓存的 userId 与 token 不匹配，清理缓存
  if (!userIdFromToken || (savedUserId && savedUserId !== userIdFromToken)) {
    console.warn('Cached user info does not match token, clearing cache')
    clearCache()
    return null
  }

  // 如果缓存的 userId 与 token 匹配，验证并返回缓存的用户信息
  if (savedUser && savedUserId === userIdFromToken) {
    try {
      const parsedUser = JSON.parse(savedUser) as UserInfo
      // 验证缓存的用户信息格式是否正确（必须有 userId 字段）
      if (parsedUser.userId && parsedUser.userId === userIdFromToken) {
        return parsedUser
      } else {
        // 缓存格式不正确，清理
        clearCache()
        return null
      }
    } catch {
      // 解析错误，清理缓存
      clearCache()
      return null
    }
  }

  return null
}

/**
 * 清理用户相关的缓存
 */
export function clearUserCache(config?: UserCacheConfig): void {
  if (typeof window === 'undefined') {
    return
  }
  
  const clear = config?.clearCache || (() => {
    localStorage.removeItem('user')
    localStorage.removeItem('user_id')
  })
  
  clear()
}

/**
 * 保存用户信息到缓存
 * @param userInfo 用户信息
 * @param config 缓存配置（可选）
 */
export function saveUserCache(userInfo: UserInfo, config?: UserCacheConfig): void {
  if (typeof window === 'undefined') {
    return
  }
  
  const setUser = config?.userSetter || ((user: UserInfo) => {
    localStorage.setItem('user', JSON.stringify(user))
  })
  const setUserId = config?.userIdSetter || ((userId: string) => {
    localStorage.setItem('user_id', userId)
  })
  
  setUser(userInfo)
  setUserId(userInfo.userId)
}

/**
 * 检查是否有有效的 token
 * @param tokenGetter 获取 token 的函数（可选）
 * @returns 是否存在 token
 */
export function checkHasToken(tokenGetter?: () => string | null): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  
  const getToken = tokenGetter || (() => localStorage.getItem('access_token'))
  return !!getToken()
}

