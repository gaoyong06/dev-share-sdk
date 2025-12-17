/**
 * AtSeeker SDK - 统一的公共服务 SDK
 * 
 * 当前包含的服务（核心 SDK）：
 * - passport: 用户认证、注册、登录
 * - asset: 文件上传、存储、管理
 * - notification: 通知发送（短信、邮件、推送）
 * - subscription: 订阅管理
 * - payment: 支付服务
 * - marketing: 营销服务（优惠券等）
 * - shortLink: 短链接服务 ✅ 新增
 * 
 * 按需添加的服务（后续根据开发者反馈添加）：
 * - billing: 计费查询（余额、账单、统计）
 * - apiKey: API Key 管理（主要用于自动化场景）
 */

// 导出所有类型和服务
export * from './types'
export * from './client'
export * from './utils'
export * from './services/passport'
export * from './services/asset'
export * from './services/notification'
export * from './services/subscription'
export * from './services/payment'
export * from './services/marketing'
export * from './services/app'
export * from './services/short-link'

// 导入服务类
import { RequestClient } from './client'
import { PassportService } from './services/passport'
import { AssetService } from './services/asset'
import { NotificationService } from './services/notification'
import { SubscriptionService } from './services/subscription'
import { PaymentService } from './services/payment'
import { MarketingService } from './services/marketing'
import { AppService } from './services/app'
import { ShortLinkService } from './services/short-link'
import type { SDKConfig } from './types/config'

/**
 * AtSeeker SDK 主类
 * 
 * @example
 * ```typescript
 * import { AtSeekerSDK } from '@atseeker/sdk'
 * 
 * // 初始化 SDK
 * const sdk = new AtSeekerSDK({
 *   baseURL: 'https://api.atseeker.com',
 *   apiKey: 'your-api-key',
 * })
 * 
 * // 使用服务
 * const result = await sdk.passport.login({
 *   contactType: 'email',
 *   contact: 'user@example.com',
 *   password: 'password123',
 * })
 * ```
 */
export class AtSeekerSDK {
  private config: SDKConfig
  private client: RequestClient

  // 核心服务（7个）
  readonly passport: PassportService
  readonly asset: AssetService
  readonly notification: NotificationService
  readonly subscription: SubscriptionService
  readonly payment: PaymentService
  readonly marketing: MarketingService
  readonly app: AppService
  readonly shortLink: ShortLinkService

  constructor(config: SDKConfig) {
    this.config = config
    this.client = new RequestClient(config)

    // 初始化核心服务
    this.passport = new PassportService(this.client, config.appId)
    this.asset = new AssetService(this.client)
    this.notification = new NotificationService(this.client)
    this.subscription = new SubscriptionService(this.client)
    this.payment = new PaymentService(this.client, config.appId)
    this.marketing = new MarketingService(this.client)
    this.app = new AppService(this.client)
    this.shortLink = new ShortLinkService(this.client)
  }

  /**
   * 获取配置
   */
  getConfig(): SDKConfig {
    return { ...this.config }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<SDKConfig>): void {
    this.config = { ...this.config, ...config }
    this.client = new RequestClient(this.config)

    // 重新初始化服务（需要 defaultAppId 的服务）
    this.passport = new PassportService(this.client, this.config.appId)
    this.payment = new PaymentService(this.client, this.config.appId)
  }
}

// 默认导出
export default AtSeekerSDK
