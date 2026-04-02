// SDK 配置类型定义

export interface SDKConfig {
  // 基础配置
  baseURL?: string              // API 基础地址（默认：http://localhost:9080）
  apiKey?: string               // API Key（外部开发者）
  appId?: string                // App ID（内部项目）
  
  // 认证配置
  tokenStorage?: 'localStorage' | 'sessionStorage' | 'memory' | 'custom'
  tokenKey?: string             // Token 存储的 key（默认：access_token）
  customTokenGetter?: () => string | null  // 自定义 token 获取函数
  customTokenSetter?: (token: string) => void  // 自定义 token 设置函数
  
  // 请求配置
  timeout?: number              // 请求超时时间（毫秒）
  retry?: number                // 重试次数
  useProxy?: boolean             // 是否使用代理
  apiProxy?: string              // 代理路径（默认：/api/proxy）
  /**
   * 每条请求附加的 Accept-Language（如 en-US、zh-CN），需与 passport 等服务的 i18n 中间件一致。
   * 浏览器默认 Accept-Language 常与站点语言不一致（例如英文页仍首选系统中文），会导致 API errorMessage 语言错误。
   */
  getAcceptLanguage?: () => string
  
  // 内部使用配置（可选）
  internal?: {
    enableUserCache?: boolean    // 启用用户缓存（仅内部）
    enableMetrics?: boolean      // 启用指标收集（仅内部）
  }
}

