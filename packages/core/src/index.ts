/**
 * AtSeeker SDK - 统一的公共服务 SDK
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

import { RequestClient } from './client/request'
import { PassportService } from './services/passport'
import { AssetService } from './services/asset'
import { NotificationService } from './services/notification'
import { SubscriptionService } from './services/subscription'
import { BillingService } from './services/billing'
import type { SDKConfig } from './types/config'

export class AtSeekerSDK {
  private config: SDKConfig
  private client: RequestClient
  
  // 服务实例
  public readonly passport: PassportService
  public readonly asset: AssetService
  public readonly notification: NotificationService
  public readonly subscription: SubscriptionService
  public readonly billing: BillingService

  constructor(config: SDKConfig) {
    this.config = config
    this.client = new RequestClient(config)
    
    // 初始化服务
    this.passport = new PassportService(this.client, config.appId)
    this.asset = new AssetService(this.client)
    this.notification = new NotificationService(this.client)
    this.subscription = new SubscriptionService(this.client)
    this.billing = new BillingService(this.client)
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
    // 重新创建客户端以应用新配置
    this.client = new RequestClient(this.config)
    
    // 重新初始化服务
    this.passport = new PassportService(this.client, this.config.appId)
    this.asset = new AssetService(this.client)
    this.notification = new NotificationService(this.client)
    this.subscription = new SubscriptionService(this.client)
    this.billing = new BillingService(this.client)
  }
}

// 导出类型
export * from './types'
export * from './types/config'
export * from './utils/jwt'
export * from './utils/user-cache'
export * from './client/request'
export * from './client/auth'
export * from './client/error'

// 默认导出
export default AtSeekerSDK

