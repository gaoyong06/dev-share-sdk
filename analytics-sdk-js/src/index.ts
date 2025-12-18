/**
 * Analytics SDK 入口文件
 */

export { Analytics } from './analytics'
export { EventQueue } from './event-queue'
// 显式导出浏览器端一键初始化函数（确保 Next.js webpack 能正确解析）
export { initAnalytics, getAnalytics } from './browser'
export type { InitAnalyticsOptions } from './browser'
export * from './types'
export * from './utils'

// 默认导出
import { Analytics } from './analytics'
export default Analytics

