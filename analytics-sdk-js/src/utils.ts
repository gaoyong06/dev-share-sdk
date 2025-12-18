/**
 * Analytics SDK 工具函数
 */

import type { UTMParams, BrowserInfo } from './types'

// 导入轻量级 UUID 库作为 fallback
// @lukeed/uuid/secure 只有 235 bytes (gzipped)，非常轻量，且使用加密安全的随机数生成器
// 注意：现代浏览器优先使用 crypto.randomUUID()，这个库只在旧浏览器中使用
import { v4 as uuidv4 } from '@lukeed/uuid/secure'

/**
 * 生成唯一 ID（UUID v4 格式）
 * 遵循行业最佳实践：优先使用原生 API，fallback 使用轻量级开源库
 * 
 * 策略：
 * 1. 优先使用 crypto.randomUUID()（现代浏览器原生 API，无依赖）
 * 2. Fallback 使用 @lukeed/uuid（轻量级，只有 235 bytes gzipped）
 * 3. 最后的 fallback：使用时间戳 + 随机数（确保最大兼容性）
 * 
 * UUID v4 格式：xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * 其中第 13 个字符是 '4'（版本号），第 17 个字符是 '8'-'b'（变体）
 */
export function generateId(): string {
  // 优先使用 crypto.randomUUID()（现代浏览器和 Node.js 16.7.0+）
  // 这是原生 API，无依赖，性能最好
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID()
    } catch (error) {
      // 如果 randomUUID 失败，继续使用 fallback
    }
  }

  // Fallback: 使用轻量级开源库 @lukeed/uuid
  // 这个库只有 235 bytes (gzipped)，比我们自己实现更可靠
  // 使用加密安全的版本（内部使用 crypto.getRandomValues）
  try {
    return uuidv4()
  } catch (error) {
    // 如果生成失败，使用最后的 fallback
  }

  // 最后的 fallback: 使用时间戳 + 随机数（不推荐，但确保兼容性）
  // 注意：这不是标准的 UUID 格式，但可以确保唯一性
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 15)
  const randomPart2 = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${randomPart}-${randomPart2}`
}

/**
 * 生成会话 ID
 * 使用 localStorage 存储会话 ID，确保同一会话使用相同的 ID
 * 注意：会话 ID 在页面刷新时会重新生成（这是正常的，因为每次刷新都是新会话）
 */
export function generateSessionId(): string {
  if (typeof window === 'undefined') {
    return generateId()
  }

  const storageKey = '__analytics_session_id__'
  
  // 尝试从 localStorage 读取已存在的会话 ID
  try {
    const existingSessionId = localStorage.getItem(storageKey)
    if (existingSessionId && existingSessionId.trim() !== '') {
      return existingSessionId
    }
  } catch (error) {
    // localStorage 可能被禁用，记录错误但继续执行
    debugLog('Failed to read session_id from localStorage:', error)
  }
  
  // 生成新的会话 ID
  const sessionId = generateId()
  
  // 尝试保存到 localStorage
  try {
    localStorage.setItem(storageKey, sessionId)
  } catch (error) {
    // localStorage 可能被禁用或已满，记录错误但继续使用生成的 ID
    debugLog('Failed to save session_id to localStorage:', error)
  }
  
  return sessionId
}

/**
 * 从 URL 中提取 UTM 参数
 */
export function extractUTMParams(url?: string): UTMParams {
  const params: UTMParams = {}
  
  if (typeof window === 'undefined') {
    return params
  }
  
  const searchParams = new URLSearchParams(url ? new URL(url).search : window.location.search)
  
  // URL 参数与 SDK 内部字段统一使用小驼峰命名
  const utmKeys: Array<keyof UTMParams> = ['utmSource', 'utmMedium', 'utmCampaign', 'utmTerm', 'utmContent']
  utmKeys.forEach((key) => {
    const value = searchParams.get(key as string)
    if (value) {
      params[key] = value
    }
  })
  
  return params
}

/**
 * 从 localStorage 获取 UTM 参数（首次访问时保存）
 */
export function getStoredUTMParams(): UTMParams {
  if (typeof window === 'undefined') {
    return {}
  }
  
  const storageKey = '__analytics_utm_params__'
  const stored = localStorage.getItem(storageKey)
  
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return {}
    }
  }
  
  // 首次访问，从 URL 提取并保存
  const utmParams = extractUTMParams()
  if (Object.keys(utmParams).length > 0) {
    localStorage.setItem(storageKey, JSON.stringify(utmParams))
    return utmParams
  }
  
  return {}
}

/**
 * 获取浏览器信息
 */
export function getBrowserInfo(): BrowserInfo {
  if (typeof window === 'undefined') {
    return {
      userAgent: '',
      language: '',
      screenResolution: '',
      pageUrl: '',
      pageTitle: '',
      referrer: '',
    }
  }
  
  return {
    userAgent: navigator.userAgent,
    language: navigator.language || navigator.languages?.[0] || '',
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    pageUrl: window.location.href,
    pageTitle: document.title,
    referrer: document.referrer,
  }
}

/**
 * 获取用户 IP（通过后端 API，SDK 中无法直接获取）
 */
export function getUserIP(): Promise<string> {
  // 实际 IP 获取应该由后端处理
  return Promise.resolve('')
}

/**
 * 检查会话是否过期
 */
export function isSessionExpired(lastActivityTime: number, sessionTimeout: number): boolean {
  return Date.now() - lastActivityTime > sessionTimeout
}

/**
 * 格式化日期为 ISO 字符串
 */
export function formatTimestamp(date: Date): string {
  return date.toISOString()
}

/**
 * 日志输出（仅在调试模式下）
 */
export function debugLog(message: string, ...args: any[]): void {
  if (typeof window !== 'undefined' && (window as any).__analytics_debug__) {
    console.log(`[Analytics SDK] ${message}`, ...args)
  }
}

