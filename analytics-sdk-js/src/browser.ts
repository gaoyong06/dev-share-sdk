/**
 * 浏览器端一键初始化（推荐用法）
 * 目标：让业务方用极少代码完成接入。
 */

import { Analytics } from './analytics'
import type { AnalyticsConfig } from './types'
import { debugLog } from './utils'

export interface InitAnalyticsOptions
  extends Omit<AnalyticsConfig, 'apiUrl' | 'userId' | 'autoTrackPageView'> {
  /**
   * API Base URL
   * - useProxy=true 时可以留空（SDK 会用 apiProxy 透传）
   */
  apiUrl?: string
  /**
   * userId 获取函数（默认读 localStorage['user_id']）
   */
  getUserId?: () => string
  /**
   * 自动监听页面切换并上报 page_view
   * 默认开启
   */
  autoTrackPageView?: boolean
  /**
   * SPA 路由监听策略
   * - history：通过 hook history.pushState/replaceState + popstate
   * 默认 history
   */
  routeTracking?: 'history' | 'manual'
  /**
   * 自动从 meta 标签读取 appId（仅当 options.appId 为空时）
   * <meta name="analytics-app-id" content="xxx" />
   */
  appIdMetaName?: string
}

declare global {
  interface Window {
    __DEV_SHARE_ANALYTICS__?: Analytics
    __DEV_SHARE_ANALYTICS_APP_ID__?: string
  }
}

function getMetaContent(name: string): string {
  if (typeof document === 'undefined') {
    return ''
  }
  const el = document.querySelector(`meta[name="${name}"]`)
  return el?.getAttribute('content') || ''
}

function resolveAppId(options: InitAnalyticsOptions): string {
  if (options.appId) {
    return options.appId
  }
  if (typeof window !== 'undefined' && window.__DEV_SHARE_ANALYTICS_APP_ID__) {
    return window.__DEV_SHARE_ANALYTICS_APP_ID__ || ''
  }
  const metaName = options.appIdMetaName || 'analytics-app-id'
  return getMetaContent(metaName)
}

function defaultGetUserId(): string {
  if (typeof window === 'undefined') {
    return ''
  }
  return localStorage.getItem('user_id') || ''
}

function buildPageUrl(): string {
  if (typeof window === 'undefined') {
    return ''
  }
  return window.location.href
}

function trackPageView(analytics: Analytics) {
  analytics.track({
    eventName: 'page_view',
    pageUrl: buildPageUrl(),
    pageTitle: typeof document !== 'undefined' ? document.title : '',
    referrer: typeof document !== 'undefined' ? document.referrer : '',
  })
}

function setupHistoryTracking(analytics: Analytics) {
  if (typeof window === 'undefined') {
    return
  }

  const emit = () => trackPageView(analytics)

  window.addEventListener('popstate', emit)

  // hook pushState/replaceState（覆盖 SPA 路由跳转）
  const _pushState = history.pushState
  const _replaceState = history.replaceState

  history.pushState = function (...args) {
    const ret = _pushState.apply(this, args as any)
    emit()
    return ret
  }

  history.replaceState = function (...args) {
    const ret = _replaceState.apply(this, args as any)
    emit()
    return ret
  }

  // 兜底：hash 变化也算一次 PV
  window.addEventListener('hashchange', emit)
}

/**
 * initAnalytics
 * - 生成并缓存单例（window.__DEV_SHARE_ANALYTICS__）
 * - 默认自动上报 page_view（首次 + 路由变化）
 */
export function initAnalytics(options: InitAnalyticsOptions): Analytics | null {
  if (typeof window === 'undefined') {
    return null
  }

  if (window.__DEV_SHARE_ANALYTICS__) {
    return window.__DEV_SHARE_ANALYTICS__
  }

  const appId = resolveAppId(options)
  if (!appId) {
    // 不抛错，避免影响业务；只在调试模式下提示
    debugLog('Missing appId, analytics disabled.')
    return null
  }

  const getUserId = options.getUserId || defaultGetUserId
  const useProxy = options.useProxy !== false
  const apiProxy = options.apiProxy || '/api/proxy'
  const apiUrl = options.apiUrl || ''

  const analytics = new Analytics({
    apiUrl,
    useProxy,
    apiProxy,
    appId,
    userId: getUserId(),
    autoTrackPageView: false, // 统一在这里控制，避免 SDK 内部重复
    autoTrackClick: options.autoTrackClick,
    batchInterval: options.batchInterval,
    batchSize: options.batchSize,
    sessionTimeout: options.sessionTimeout,
    debug: options.debug,
  })

  window.__DEV_SHARE_ANALYTICS__ = analytics

  const shouldAutoTrack = options.autoTrackPageView !== false
  if (shouldAutoTrack) {
    // 首次进入
    trackPageView(analytics)

    const strategy = options.routeTracking || 'history'
    if (strategy === 'history') {
      setupHistoryTracking(analytics)
    }
  }

  return analytics
}

export function getAnalytics(): Analytics | null {
  if (typeof window === 'undefined') {
    return null
  }
  return window.__DEV_SHARE_ANALYTICS__ || null
}

