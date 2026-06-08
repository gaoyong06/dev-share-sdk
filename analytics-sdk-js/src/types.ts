/**
 * Analytics SDK 类型定义
 */

export interface AnalyticsConfig {
  /** API 端点 URL */
  apiUrl: string
  /** 是否使用前端代理（解决 CORS） */
  useProxy?: boolean
  /** 前端代理路径（例如：/api/proxy） */
  apiProxy?: string
  /** 应用 ID */
  appId: string
  /** API Key（可选，浏览器侧通常通过 BFF 注入；直连场景需提供） */
  apiKey?: string
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

  // ---- 重试 / 持久化 / 退避（详见 EventQueue 实现） ----
  /** 单条事件最大重试次数。默认 5 */
  maxRetries?: number
  /** 指数退避初始延迟（毫秒）。默认 1000 */
  initialBackoffMs?: number
  /** 指数退避延迟上限（毫秒）。默认 60000 */
  maxBackoffMs?: number
  /** 队列内事件最大存活时间（毫秒），超出丢入 DLQ。默认 86400000（24h） */
  maxEventAgeMs?: number
  /** 是否启用 localStorage 持久化。默认 true */
  persistEnabled?: boolean
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
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
}

export interface BrowserInfo {
  userAgent: string
  language: string
  screenResolution: string
  pageUrl: string
  pageTitle: string
  referrer: string
}

/** 会话结束事件名（页面卸载时通过 sendBeacon 上报，供服务端用客户端 timestamp 计算 duration） */
export const EVENT_SESSION_END = 'session_end'

export interface PendingEvent extends TrackEventOptions {
  id: string
  timestamp: Date
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  userAgent?: string
  language?: string
  screenResolution?: string
}

