# @atseeker/sdk

AtSeeker Services JavaScript SDK - 统一的公共服务 SDK

## 安装

```bash
npm install @atseeker/sdk
# 或
yarn add @atseeker/sdk
# 或
pnpm add @atseeker/sdk
```

## 快速开始

### 外部开发者使用

```typescript
import { AtSeekerSDK } from '@atseeker/sdk'

// 初始化 SDK
const sdk = new AtSeekerSDK({
  baseURL: 'https://api.atseeker.com',
  apiKey: 'your-api-key',
})

// 用户登录
const result = await sdk.passport.login({
  contactType: 'email',
  contact: 'user@example.com',
  password: 'password123',
})

if (result.error) {
  console.error('登录失败:', result.error.message)
} else {
  console.log('登录成功:', result.data)
  // 保存 token
  localStorage.setItem('access_token', result.data.accessToken)
}
```

### 内部项目使用

```typescript
import { AtSeekerSDK } from '@atseeker/sdk'

// 初始化 SDK（使用 App ID）
const sdk = new AtSeekerSDK({
  baseURL: process.env.NEXT_PUBLIC_APISIX_GATEWAY_URL || 'http://localhost:9080',
  appId: process.env.NEXT_PUBLIC_APP_ID,
  internal: {
    enableUserCache: true,
  },
})

// 使用服务
const result = await sdk.passport.login({
  contactType: 'email',
  contact: 'user@example.com',
  password: 'password123',
}, 'your-app-id')
```

## API 文档

### Passport Service（认证服务）

```typescript
// 登录
await sdk.passport.login({
  contactType: 'email',
  contact: 'user@example.com',
  password: 'password123',
})

// 注册
await sdk.passport.register({
  nickname: 'John Doe',
  password: 'password123',
  contactType: 'email',
  contact: 'user@example.com',
  captcha: '123456',
})

// 发送验证码
await sdk.passport.sendCaptcha({
  contactType: 'email',
  contact: 'user@example.com',
  scene: 'captcha_register',
})

// 重置密码
await sdk.passport.resetPassword({
  contactType: 'email',
  contact: 'user@example.com',
  captcha: '123456',
  newPassword: 'newpassword123',
})

// 获取用户信息
await sdk.passport.getUser('user-id')
```

### Asset Service（文件服务）

```typescript
// 上传文件
const file = document.querySelector('input[type="file"]').files[0]
const result = await sdk.asset.uploadFile(file, {
  business_type: 'question_document',
  source: 'question_hub_web',
})

// 获取文件信息
await sdk.asset.getFileInfo('file-id')

// 获取文件 URL
await sdk.asset.getFileURL('file-id', 3600) // 1小时有效期

// 删除文件
await sdk.asset.deleteFile('file-id')

// 列出文件
await sdk.asset.listFiles({
  page: 1,
  pageSize: 20,
  businessType: 'question_document',
})
```

### Notification Service（通知服务）

```typescript
// 发送通知
await sdk.notification.send({
  channel: 'email',
  recipient: 'user@example.com',
  templateId: 'welcome-email',
  params: {
    name: 'John',
  },
})
```

### Subscription Service（订阅服务）

```typescript
// 创建订阅
await sdk.subscription.create({
  planId: 'plan-id',
  userId: 'user-id',
})

// 获取订阅详情
await sdk.subscription.get('subscription-id')

// 取消订阅
await sdk.subscription.cancel('subscription-id')
```

### Billing Service（计费服务）

```typescript
// 获取账户信息
await sdk.billing.getAccount('user-id')

// 充值
await sdk.billing.recharge({
  userId: 'user-id',
  amount: 100,
  paymentMethod: 'wechat',
})
```

## 配置选项

```typescript
interface SDKConfig {
  // 基础配置
  baseURL?: string              // API 基础地址（默认：http://localhost:9080）
  apiKey?: string               // API Key（外部开发者）
  appId?: string                // App ID（内部项目）
  
  // 认证配置
  tokenStorage?: 'localStorage' | 'sessionStorage' | 'memory' | 'custom'
  tokenKey?: string             // Token 存储的 key（默认：access_token）
  customTokenGetter?: () => string | null
  customTokenSetter?: (token: string) => void
  
  // 请求配置
  timeout?: number              // 请求超时时间（毫秒）
  retry?: number                // 重试次数
  useProxy?: boolean             // 是否使用代理
  apiProxy?: string              // 代理路径（默认：/api/proxy）
  
  // 内部使用配置（可选）
  internal?: {
    enableUserCache?: boolean    // 启用用户缓存（仅内部）
    enableMetrics?: boolean      // 启用指标收集（仅内部）
  }
}
```

## 工具函数

### JWT 解析

```typescript
import { parseUserIdFromToken, getUserIdFromToken } from '@atseeker/sdk'

// 解析 token 中的 userId
const userId = parseUserIdFromToken(token)

// 从存储中获取并解析 userId
const userId = getUserIdFromToken()
```

### 用户缓存管理

```typescript
import {
  validateAndGetCachedUser,
  saveUserCache,
  clearUserCache,
  checkHasToken,
} from '@atseeker/sdk'

// 验证并获取缓存的用户信息
const user = validateAndGetCachedUser()

// 保存用户信息到缓存
saveUserCache(userInfo)

// 清理用户缓存
clearUserCache()

// 检查是否有 token
const hasToken = checkHasToken()
```

## License

MIT

