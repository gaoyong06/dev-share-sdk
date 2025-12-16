# SDK 迁移指南

## 📋 概述

本文档说明如何将现有项目迁移到使用 `@atseeker/sdk`。

## 🎯 迁移步骤

### 1. 安装 SDK

```bash
# 在项目根目录
npm install @atseeker/sdk
# 或
pnpm add @atseeker/sdk
# 或
yarn add @atseeker/sdk
```

### 2. 创建 SDK 实例

在项目中创建一个 SDK 实例文件（例如 `lib/sdk.ts`）：

```typescript
import { AtSeekerSDK } from '@atseeker/sdk'

// 外部开发者使用
export const sdk = new AtSeekerSDK({
  baseURL: process.env.NEXT_PUBLIC_APISIX_GATEWAY_URL || 'http://localhost:9080',
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
})

// 内部项目使用（带 App ID）
export const sdk = new AtSeekerSDK({
  baseURL: process.env.NEXT_PUBLIC_APISIX_GATEWAY_URL || 'http://localhost:9080',
  appId: process.env.NEXT_PUBLIC_APP_ID,
  internal: {
    enableUserCache: true,
  },
})
```

### 3. 替换 API 调用

#### Passport Service

```typescript
// 之前
import { passportApi } from '@/lib/api'
const result = await passportApi.login({
  contactType: 'email',
  contact: 'user@example.com',
  password: 'password123',
})

// 之后
import { sdk } from '@/lib/sdk'
const result = await sdk.passport.login({
  contactType: 'email',
  contact: 'user@example.com',
  password: 'password123',
})
```

#### Asset Service

```typescript
// 之前
import { assetApi } from '@/lib/api'
const result = await assetApi.uploadFile(file, {
  business_type: 'question_document',
  source: 'question_hub_web',
})

// 之后
import { sdk } from '@/lib/sdk'
const result = await sdk.asset.uploadFile(file, {
  business_type: 'question_document',
  source: 'question_hub_web',
})
```

### 4. 更新类型导入

```typescript
// 之前
import type { UserInfo, LoginRequest, TokenResponse } from '@/lib/api/types'

// 之后
import type { UserInfo, LoginRequest, TokenResponse } from '@atseeker/sdk'
```

### 5. 更新工具函数导入

```typescript
// 之前
import { getUserIdFromToken } from '@/lib/utils/jwt'
import { validateAndGetCachedUser } from '@/lib/utils/user-cache'

// 之后
import { getUserIdFromToken, validateAndGetCachedUser } from '@atseeker/sdk'
```

### 6. 删除旧的 API 文件

迁移完成后，可以删除以下文件：
- `lib/api/client.ts`
- `lib/api/passport.ts`
- `lib/api/asset.ts`
- `lib/api/types.ts`（如果类型已完全迁移）
- `lib/utils/jwt.ts`（如果已迁移）
- `lib/utils/user-cache.ts`（如果已迁移）

## 📝 迁移检查清单

- [ ] 安装 SDK
- [ ] 创建 SDK 实例
- [ ] 替换所有 API 调用
- [ ] 更新类型导入
- [ ] 更新工具函数导入
- [ ] 测试所有功能
- [ ] 删除旧的 API 文件

## 🔍 常见问题

### Q: 如何保持向后兼容？

A: 可以在迁移过程中保留旧的 API 文件，但内部调用 SDK：

```typescript
// lib/api/passport.ts（过渡期）
import { sdk } from '../sdk'

export const login = (request: LoginRequest, appId?: string) => {
  return sdk.passport.login(request, appId)
}
```

### Q: 如何处理环境变量？

A: SDK 支持通过配置传入环境变量，建议在 SDK 实例创建时统一处理：

```typescript
export const sdk = new AtSeekerSDK({
  baseURL: process.env.NEXT_PUBLIC_APISIX_GATEWAY_URL || 'http://localhost:9080',
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  useProxy: process.env.NEXT_PUBLIC_USE_PROXY === 'true',
  apiProxy: process.env.NEXT_PUBLIC_API_PROXY || '/api/proxy',
})
```

### Q: 如何处理内部项目的特殊需求？

A: 使用 `internal` 配置选项：

```typescript
const sdk = new AtSeekerSDK({
  baseURL: process.env.NEXT_PUBLIC_APISIX_GATEWAY_URL,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  internal: {
    enableUserCache: true,
    enableMetrics: true,
  },
})
```

## 🚀 下一步

迁移完成后，建议：

1. 更新项目文档
2. 更新 CI/CD 配置（如果需要）
3. 在团队内部分享迁移经验
4. 监控 SDK 使用情况

