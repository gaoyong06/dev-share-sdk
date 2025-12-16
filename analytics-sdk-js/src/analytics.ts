/**
 * Analytics SDK 核心类
 */

import type {
  AnalyticsConfig,
  TrackEventOptions,
  EventProperties,
  PendingEvent,
} from './types'
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

  constructor(config: AnalyticsConfig) {
    // 设置默认配置
    this.config = {
      apiUrl: config.apiUrl,
      appId: config.appId,
      userId: config.userId || '',
      autoTrackPageView: config.autoTrackPageView !== false,
      autoTrackClick: config.autoTrackClick || false,
      batchInterval: config.batchInterval || 5000, // 5秒
      batchSize: config.batchSize || 10,
      sessionTimeout: config.sessionTimeout || 30 * 60 * 1000, // 30分钟
      debug: config.debug || false,
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

    // 初始化事件队列
    this.eventQueue = new EventQueue(
      this.config.batchSize,
      this.config.batchInterval,
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

    // 监听页面卸载，确保事件发送
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.eventQueue.flush()
      })
    }

    debugLog('Analytics SDK initialized', this.config)
  }

  /**
   * 获取或创建匿名 ID
   */
  private getOrCreateAnonymousId(): string {
    if (typeof window === 'undefined') {
      return generateId()
    }

    const storageKey = '__analytics_anonymous_id__'
    const existingId = localStorage.getItem(storageKey)

    if (existingId) {
      return existingId
    }

    const newId = generateId()
    localStorage.setItem(storageKey, newId)
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

    const event: Omit<PendingEvent, 'id' | 'timestamp'> = {
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
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign,
      utm_term: utmParams.utm_term,
      utm_content: utmParams.utm_content,
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
   * 发送批量事件
   */
  private async sendBatchEvents(events: PendingEvent[]): Promise<void> {
    if (events.length === 0) {
      return
    }

    const url = `${this.config.apiUrl}/v1/analytics/events/batch`

    const requestBody = {
      events: events.map((event) => ({
        app_id: this.config.appId,
        event_name: event.eventName,
        user_id: event.userId || '',
        session_id: event.sessionId,
        anonymous_id: event.anonymousId,
        page_url: event.pageUrl,
        page_title: event.pageTitle,
        referrer: event.referrer,
        utm_source: event.utm_source,
        utm_medium: event.utm_medium,
        utm_campaign: event.utm_campaign,
        utm_term: event.utm_term,
        utm_content: event.utm_content,
        user_agent: event.userAgent,
        ip: '', // IP 由后端获取
        language: event.language,
        screen_resolution: event.screenResolution,
        properties: event.properties || {},
        timestamp: formatTimestamp(event.timestamp),
      })),
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
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

