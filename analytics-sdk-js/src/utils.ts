/**
 * Analytics SDK 工具函数
 */

import type { UTMParams, BrowserInfo } from './types'

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 生成会话 ID
 */
export function generateSessionId(): string {
  // 使用 localStorage 存储会话 ID，确保同一会话使用相同的 ID
  const storageKey = '__analytics_session_id__'
  const existingSessionId = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null
  
  if (existingSessionId) {
    return existingSessionId
  }
  
  const sessionId = generateId()
  if (typeof window !== 'undefined') {
    localStorage.setItem(storageKey, sessionId)
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

