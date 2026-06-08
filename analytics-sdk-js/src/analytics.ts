/**
 * Analytics SDK 核心类
 */

import type {
  AnalyticsConfig,
  TrackEventOptions,
  EventProperties,
  PendingEvent,
} from './types'
import { EVENT_SESSION_END } from './types'
import {
  generateId,
  generateSessionId,
  getStoredUTMParams,
  getBrowserInfo,
  isSessionExpired,
  formatTimestamp,
  debugLog,
} from './utils'
import { EventQueue } from './event-queue'

export class Analytics {
  private config: Required<AnalyticsConfig>
  private sessionId: string
  private lastActivityTime: number
  private eventQueue: EventQueue
  private anonymousId: string
  /** 是否已发送 session_end（避免 pagehide/beforeunload 重复发送） */
  private sessionEndSent = false

  constructor(config: AnalyticsConfig) {
    // 设置默认配置
    this.config = {
      apiUrl: config.apiUrl,
      useProxy: config.useProxy || false,
      apiProxy: config.apiProxy || '/api/proxy',
      appId: config.appId,
      apiKey: config.apiKey || '',
      userId: config.userId || '',
      autoTrackPageView: config.autoTrackPageView !== false,
      autoTrackClick: config.autoTrackClick || false,
      batchInterval: config.batchInterval || 5000, // 5秒
      batchSize: config.batchSize || 10,
      sessionTimeout: config.sessionTimeout || 30 * 60 * 1000, // 30分钟
      debug: config.debug || false,
      maxRetries: config.maxRetries ?? 5,
      initialBackoffMs: config.initialBackoffMs ?? 1000,
      maxBackoffMs: config.maxBackoffMs ?? 60_000,
      maxEventAgeMs: config.maxEventAgeMs ?? 24 * 60 * 60 * 1000,
      persistEnabled: config.persistEnabled ?? true,
    }

    // 启用调试模式
    if (this.config.debug && typeof window !== 'undefined') {
      (window as any).__analytics_debug__ = true
    }

    // 初始化会话
    this.sessionId = generateSessionId()
    this.lastActivityTime = Date.now()

    // 初始化匿名 ID
    this.anonymousId = this.getOrCreateAnonymousId()

    // 初始化事件队列（带指数退避 + localStorage 持久化）
    this.eventQueue = new EventQueue(
      {
        batchSize: this.config.batchSize,
        batchInterval: this.config.batchInterval,
        maxRetries: this.config.maxRetries,
        initialBackoffMs: this.config.initialBackoffMs,
        maxBackoffMs: this.config.maxBackoffMs,
        maxEventAgeMs: this.config.maxEventAgeMs,
        persistEnabled: this.config.persistEnabled,
      },
      (events) => this.sendBatchEvents(events)
    )

    // 自动追踪页面浏览
    if (this.config.autoTrackPageView) {
      this.trackPageView()
    }

    // 自动追踪点击事件
    if (this.config.autoTrackClick) {
      this.setupClickTracking()
    }

    // 监听页面卸载：先通过 sendBeacon 发 session_end（可靠），再 flush 队列（尽力而为）
    if (typeof window !== 'undefined') {
      const onUnload = () => {
        this.sendSessionEndBeacon()
        this.eventQueue.flush()
      }
      window.addEventListener('pagehide', onUnload)
      window.addEventListener('beforeunload', onUnload)
    }

    debugLog('Analytics SDK initialized', this.config)
  }

  /**
   * 获取或创建匿名 ID
   * 遵循行业最佳实践：
   * 1. 使用 localStorage 持久化 anonymous_id（跨会话保持）
   * 2. 添加错误处理（localStorage 可能失败或被禁用）
   * 3. 确保 ID 的唯一性和持久性
   * 
   * 重要：anonymous_id 必须在整个用户生命周期内保持一致，即使：
   * - 页面刷新
   * - 关闭浏览器后重新打开
   * - 清除 cookies（但不清除 localStorage）
   */
  private getOrCreateAnonymousId(): string {
    if (typeof window === 'undefined') {
      return generateId()
    }

    const storageKey = '__analytics_anonymous_id__'
    
    // 尝试从 localStorage 读取已存在的 ID
    try {
      const existingId = localStorage.getItem(storageKey)
      if (existingId && existingId.trim() !== '') {
        debugLog('Found existing anonymous_id from localStorage:', existingId)
        return existingId
      }
      debugLog('No existing anonymous_id in localStorage, will create new one')
    } catch (error) {
      // localStorage 可能被禁用或已满，记录错误但继续执行
      debugLog('Failed to read anonymous_id from localStorage:', error)
    }

    // 生成新的 ID
    const newId = generateId()
    debugLog('Generated new anonymous_id:', newId)
    
    // 尝试保存到 localStorage
    try {
      localStorage.setItem(storageKey, newId)
      debugLog('Saved anonymous_id to localStorage:', newId)
    } catch (error) {
      // localStorage 可能被禁用或已满，记录错误但继续使用生成的 ID
      debugLog('Failed to save anonymous_id to localStorage:', error)
      // 注意：即使保存失败，我们仍然返回生成的 ID，确保本次会话可以正常使用
      // 但这样会导致每次刷新页面都生成新的 ID，影响用户识别准确性
    }
    
    return newId
  }

  /**
   * 检查并更新会话
   */
  private checkAndUpdateSession(): void {
    const now = Date.now()
    
    if (isSessionExpired(this.lastActivityTime, this.config.sessionTimeout)) {
      // 会话过期，创建新会话
      this.sessionId = generateSessionId()
      debugLog('Session expired, created new session:', this.sessionId)
    }
    
    this.lastActivityTime = now
  }

  /**
   * 追踪事件
   */
  track(options: TrackEventOptions): void {
    this.checkAndUpdateSession()

    const browserInfo = getBrowserInfo()
    const utmParams = getStoredUTMParams()

    const event: Omit<PendingEvent, 'id'> = {
      eventName: options.eventName,
      properties: options.properties || {},
      userId: options.userId || this.config.userId,
      sessionId: options.sessionId || this.sessionId,
      anonymousId: options.anonymousId || this.anonymousId,
      pageUrl: options.pageUrl || browserInfo.pageUrl,
      pageTitle: options.pageTitle || browserInfo.pageTitle,
      referrer: options.referrer || browserInfo.referrer,
      timestamp: options.timestamp || new Date(),
      // 添加 UTM 参数到 properties
      utmSource: utmParams.utmSource,
      utmMedium: utmParams.utmMedium,
      utmCampaign: utmParams.utmCampaign,
      utmTerm: utmParams.utmTerm,
      utmContent: utmParams.utmContent,
      // 添加浏览器信息到 properties
      userAgent: browserInfo.userAgent,
      language: browserInfo.language,
      screenResolution: browserInfo.screenResolution,
    }

    this.eventQueue.enqueue(event)
  }

  /**
   * 追踪页面浏览
   */
  trackPageView(properties?: EventProperties): void {
    this.track({
      eventName: 'page_view',
      properties,
    })
  }

  /**
   * 追踪点击事件
   */
  trackClick(element: HTMLElement, properties?: EventProperties): void {
    const clickProperties: EventProperties = {
      element: element.tagName.toLowerCase(),
      elementId: element.id || undefined,
      elementClass: element.className || undefined,
      elementText: element.textContent?.substring(0, 100) || undefined,
      ...properties,
    }

    this.track({
      eventName: 'click',
      properties: clickProperties,
    })
  }

  /**
   * 设置自动点击追踪
   */
  private setupClickTracking(): void {
    if (typeof window === 'undefined') {
      return
    }

    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      if (target) {
        this.trackClick(target)
      }
    })
  }

  /**
   * 设置用户 ID
   */
  identify(userId: string): void {
    this.config.userId = userId
    debugLog('User identified:', userId)
  }

  /**
   * 重置用户（登出时调用）
   */
  reset(): void {
    this.config.userId = ''
    this.anonymousId = this.getOrCreateAnonymousId()
    this.sessionId = generateSessionId()
    debugLog('User reset')
  }

  /**
   * 页面卸载时通过 sendBeacon 发送会话结束事件（只带 timestamp，不带 duration）
   * 服务端用同一 session 下事件的客户端 timestamp min/max 计算 duration 和 end_time
   */
  private sendSessionEndBeacon(): void {
    if (typeof navigator === 'undefined' || !navigator.sendBeacon || this.sessionEndSent) {
      return
    }
    this.sessionEndSent = true

    const browserInfo = getBrowserInfo()
    const utmParams = getStoredUTMParams()
    const now = new Date()

    const eventPayload = {
      appId: this.config.appId,
      eventName: EVENT_SESSION_END,
      userId: this.config.userId || '',
      sessionId: this.sessionId,
      anonymousId: this.anonymousId,
      pageUrl: browserInfo.pageUrl,
      pageTitle: browserInfo.pageTitle,
      referrer: browserInfo.referrer,
      utmSource: utmParams.utmSource,
      utmMedium: utmParams.utmMedium,
      utmCampaign: utmParams.utmCampaign,
      utmTerm: utmParams.utmTerm,
      utmContent: utmParams.utmContent,
      userAgent: browserInfo.userAgent,
      ip: '',
      language: browserInfo.language,
      screenResolution: browserInfo.screenResolution,
      properties: {} as Record<string, unknown>,
      timestamp: formatTimestamp(now),
    }

    const apiPath = '/analytics/v1/track/batch'
    const url = this.config.useProxy
      ? `${this.config.apiProxy}?path=${encodeURIComponent(apiPath)}`
      : `${this.config.apiUrl}${apiPath}`

    const body = JSON.stringify({ events: [eventPayload] })
    const sent = navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))
    debugLog('Session end beacon sent:', sent)
  }

  /**
   * 发送批量事件
   */
  private async sendBatchEvents(events: PendingEvent[]): Promise<void> {
    if (events.length === 0) {
      return
    }

    const apiPath = '/analytics/v1/track/batch'
    const url = this.config.useProxy
      ? `${this.config.apiProxy}?path=${encodeURIComponent(apiPath)}`
      : `${this.config.apiUrl}${apiPath}`

    const requestBody = {
      events: events.map((event) => ({
        appId: this.config.appId,
        eventName: event.eventName,
        userId: event.userId || '',
        sessionId: event.sessionId,
        anonymousId: event.anonymousId,
        pageUrl: event.pageUrl,
        pageTitle: event.pageTitle,
        referrer: event.referrer,
        utmSource: event.utmSource,
        utmMedium: event.utmMedium,
        utmCampaign: event.utmCampaign,
        utmTerm: event.utmTerm,
        utmContent: event.utmContent,
        userAgent: event.userAgent,
        ip: '', // IP 由后端获取
        language: event.language,
        screenResolution: event.screenResolution,
        properties: event.properties || {},
        timestamp: formatTimestamp(event.timestamp),
      })),
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    // 直连模式下，如果配置了 apiKey，注入到请求头
    // 走 BFF 代理模式（useProxy=true）时，由 BFF 服务端注入 API Key，前端不携带
    if (!this.config.useProxy && this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        // 4xx 客户端错误（除 408/429）通常重试也没用，标记为不可重试错误
        // 上层 EventQueue 仍会按重试策略处理；这里只是给一个清晰的语义标识
        const isClientError = response.status >= 400 && response.status < 500 &&
          response.status !== 408 && response.status !== 429
        const errMsg = `HTTP ${response.status}${isClientError ? ' (non-retryable client error)' : ''}`
        debugLog('Failed to send batch events:', errMsg)
        throw new Error(errMsg)
      }

      const result = await response.json()
      debugLog('Batch events sent successfully:', result)
    } catch (error) {
      debugLog('Failed to send batch events:', error)
      throw error
    }
  }

  /**
   * 手动刷新队列（立即发送所有待发送事件）
   */
  async flush(): Promise<void> {
    await this.eventQueue.flush()
  }

  /**
   * 销毁 SDK 实例
   */
  destroy(): void {
    this.eventQueue.stop()
    this.eventQueue.clear()
    debugLog('Analytics SDK destroyed')
  }
}

