/**
 * Analytics SDK 类型定义
 */

export interface AnalyticsConfig {
  /** API 端点 URL */
  apiUrl: string
  /** 应用 ID */
  appId: string
  /** 用户 ID（可选，登录后设置） */
  userId?: string
  /** 是否自动追踪页面浏览 */
  autoTrackPageView?: boolean
  /** 是否自动追踪点击事件 */
  autoTrackClick?: boolean
  /** 批量发送间隔（毫秒） */
  batchInterval?: number
  /** 批量发送大小 */
  batchSize?: number
  /** 会话超时时间（毫秒） */
  sessionTimeout?: number
  /** 调试模式 */
  debug?: boolean
}

export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined
}

export interface TrackEventOptions {
  /** 事件名称 */
  eventName: string
  /** 自定义属性 */
  properties?: EventProperties
  /** 用户 ID（覆盖全局配置） */
  userId?: string
  /** 会话 ID（通常自动生成） */
  sessionId?: string
  /** 匿名 ID（用于未登录用户） */
  anonymousId?: string
  /** 页面 URL */
  pageUrl?: string
  /** 页面标题 */
  pageTitle?: string
  /** 来源 URL */
  referrer?: string
  /** 时间戳（通常自动生成） */
  timestamp?: Date
}

export interface UTMParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}

export interface BrowserInfo {
  userAgent: string
  language: string
  screenResolution: string
  pageUrl: string
  pageTitle: string
  referrer: string
}

export interface PendingEvent extends TrackEventOptions {
  id: string
  timestamp: Date
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  userAgent?: string
  language?: string
  screenResolution?: string
}

