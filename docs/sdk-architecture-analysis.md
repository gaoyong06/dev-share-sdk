# SDK 架构分析：内部公共库 vs 开发者 SDK

## 📋 现状分析

### 1. 公共服务
- **passport-service**: 用户认证、注册、登录、密码重置
- **asset-service**: 文件上传、存储、管理
- **notification-service**: 通知发送（短信、邮件、推送）
- **subscription-service**: 订阅管理
- **billing-service**: 计费服务

### 2. 前端项目
- **dev-share-web**: 面向开发者的管理平台（需要交付 SDK）
- **question-hub-web**: 内部业务前端
- **table-plan-web**: 内部业务前端

### 3. 代码重复问题
- 每个前端项目都在实现相同的 API 客户端逻辑
- `lib/api/client.ts` 在多个项目中重复
- `lib/api/passport.ts`、`lib/api/asset.ts` 等在各项目中重复实现
- 错误处理、认证逻辑、类型定义都在重复

## 🎯 核心问题

### 问题 1: SDK vs 内部公共库的关系

**选项 A：分离方案**
- **内部公共库** (`@xinyuan-tech/core`): 仅供内部项目使用
  - 包含完整的 API 客户端
  - 包含内部工具函数（如 user-cache.ts）
  - 可能包含内部配置和逻辑
- **开发者 SDK** (`@atseeker/sdk`): 面向外部开发者
  - 简化的 API 接口
  - 不包含内部实现细节
  - 更友好的 API 设计

**选项 B：统一方案（推荐）**
- **单一 SDK** (`@atseeker/sdk`): 同时满足内部和外部使用
  - 核心 API 客户端统一实现
  - 通过配置区分内部/外部使用场景
  - 内部项目作为 SDK 的"高级用户"

### 问题 2: 是否一个 SDK 可以同时满足？

**答案：可以，但需要合理设计**

**优势**：
- ✅ 代码复用最大化
- ✅ 维护成本最低
- ✅ 内部项目可以享受 SDK 的改进
- ✅ 减少代码重复

**挑战**：
- ⚠️ 需要设计良好的配置系统
- ⚠️ 需要清晰的 API 边界
- ⚠️ 需要版本管理策略

## 🏗️ 推荐架构方案

### 方案：统一 SDK + 内部扩展层

```
┌─────────────────────────────────────────┐
│         @atseeker/sdk (核心 SDK)        │
│  ┌───────────────────────────────────┐  │
│  │  Core API Client                  │  │
│  │  - HTTP 请求封装                  │  │
│  │  - 错误处理                       │  │
│  │  - 认证管理                       │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Service APIs                     │  │
│  │  - passport (认证)                │  │
│  │  - asset (文件)                   │  │
│  │  - notification (通知)            │  │
│  │  - subscription (订阅)             │  │
│  │  - billing (计费)                 │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Utilities                        │  │
│  │  - JWT 解析                        │  │
│  │  - Token 管理                      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
           ▲                    ▲
           │                    │
    ┌──────┴──────┐    ┌────────┴────────┐
    │ 内部项目使用  │    │  外部开发者使用   │
    │             │    │                │
    │ dev-share-  │    │ 开发者的项目     │
    │ web         │    │                │
    │ question-   │    │ npm install    │
    │ hub-web     │    │ @atseeker/sdk  │
    │ table-plan- │    │                │
    │ web         │    │                │
    └─────────────┘    └─────────────────┘
```

### 目录结构建议

```
dev-share-sdk/
├── packages/
│   ├── core/                    # 核心 SDK
│   │   ├── src/
│   │   │   ├── client/          # HTTP 客户端
│   │   │   │   ├── request.ts  # 请求封装
│   │   │   │   ├── error.ts    # 错误处理
│   │   │   │   └── auth.ts     # 认证管理
│   │   │   ├── services/       # 服务 API
│   │   │   │   ├── passport.ts
│   │   │   │   ├── asset.ts
│   │   │   │   ├── notification.ts
│   │   │   │   ├── subscription.ts
│   │   │   │   └── billing.ts
│   │   │   ├── utils/          # 工具函数
│   │   │   │   ├── jwt.ts
│   │   │   │   └── token.ts
│   │   │   └── index.ts        # 统一导出
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── react/                   # React Hooks（可选）
│       ├── src/
│       │   ├── hooks/
│       │   │   ├── useAuth.ts
│       │   │   ├── useUser.ts
│       │   │   └── ...
│       │   └── index.ts
│       └── package.json
│
└── package.json                  # Monorepo 根配置
```

## 🔧 实现策略

### 1. SDK 配置系统

```typescript
// SDK 初始化配置
interface SDKConfig {
  // 基础配置
  baseURL?: string              // API 基础地址
  apiKey?: string               // API Key（外部开发者）
  appId?: string                // App ID（内部项目）
  
  // 认证配置
  tokenStorage?: 'localStorage' | 'sessionStorage' | 'memory'
  tokenKey?: string
  
  // 请求配置
  timeout?: number
  retry?: number
  useProxy?: boolean
  
  // 内部使用配置（可选）
  internal?: {
    enableUserCache?: boolean    // 启用用户缓存（仅内部）
    enableMetrics?: boolean      // 启用指标收集（仅内部）
  }
}

// 初始化示例
import { AtSeekerSDK } from '@atseeker/sdk'

// 外部开发者使用
const sdk = new AtSeekerSDK({
  baseURL: 'https://api.atseeker.com',
  apiKey: 'your-api-key',
})

// 内部项目使用
const sdk = new AtSeekerSDK({
  baseURL: process.env.NEXT_PUBLIC_APISIX_GATEWAY_URL,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  internal: {
    enableUserCache: true,
  }
})
```

### 2. API 设计原则

**统一接口，配置区分**：
- 所有服务使用相同的调用方式
- 通过配置区分内部/外部行为
- 保持 API 向后兼容

**示例**：
```typescript
// SDK 使用示例（统一接口）
import { AtSeekerSDK } from '@atseeker/sdk'

const sdk = new AtSeekerSDK(config)

// 认证服务
await sdk.passport.login({ ... })
await sdk.passport.register({ ... })

// 文件服务
await sdk.asset.uploadFile(file, metadata)

// 通知服务
await sdk.notification.send({ ... })
```

### 3. 版本管理

**语义化版本**：
- `1.0.0`: 初始版本
- `1.1.0`: 新功能（向后兼容）
- `2.0.0`: 重大变更（需要迁移）

**发布策略**：
- 内部项目：可以使用 `workspace:` 协议直接引用
- 外部开发者：通过 npm 发布

## 📊 对比分析

### 方案对比

| 方案 | 代码复用 | 维护成本 | 灵活性 | 推荐度 |
|------|---------|---------|--------|--------|
| **分离方案** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **统一方案** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### 统一方案的优势

1. **代码复用最大化**
   - 所有项目使用同一套代码
   - 修复 bug 只需一次
   - 新功能自动同步

2. **维护成本最低**
   - 单一代码库
   - 统一的测试和 CI/CD
   - 统一的文档

3. **内部项目受益**
   - 享受 SDK 的改进
   - 自动获得新功能
   - 更好的类型支持

4. **开发者体验一致**
   - 内部和外部使用相同的 API
   - 降低学习成本
   - 更好的文档支持

## 🚀 实施建议

### 阶段 1: 创建核心 SDK（1-2周）
1. 创建 `dev-share-sdk/packages/core`
2. 迁移公共 API 客户端代码
3. 实现配置系统
4. 编写基础文档

### 阶段 2: 内部项目迁移（2-3周）
1. 在内部项目中引入 SDK
2. 逐步替换现有 API 调用
3. 保持向后兼容
4. 测试验证

### 阶段 3: 发布和文档（1周）
1. 发布到 npm
2. 完善文档和示例
3. 在 dev-share-web 中展示 SDK 使用

### 阶段 4: 持续优化
1. 收集反馈
2. 优化 API 设计
3. 添加新功能
4. 版本迭代

## 💡 关键决策点

### 1. 是否需要一个 SDK？
**答案：是**
- ✅ 代码重复严重
- ✅ 维护成本高
- ✅ 需要给开发者交付
- ✅ 已有 SDK 实践（analytics-sdk-js）

### 2. SDK 和内部库的关系？
**答案：统一为一个 SDK**
- ✅ 最大化代码复用
- ✅ 降低维护成本
- ✅ 通过配置区分使用场景
- ✅ 内部项目作为高级用户

### 3. 是否需要 React Hooks？
**答案：可选，分阶段**
- 第一阶段：核心 SDK（纯 JS/TS）
- 第二阶段：React Hooks 扩展包（可选）

## 📝 总结

**推荐方案：统一 SDK 架构**

1. **创建一个统一的 SDK** (`@atseeker/sdk`)
   - 同时满足内部和外部使用
   - 通过配置区分使用场景
   - 保持 API 简洁统一

2. **内部项目迁移**
   - 逐步替换现有 API 调用
   - 保持向后兼容
   - 享受 SDK 的改进

3. **对外发布**
   - 发布到 npm
   - 提供完整文档
   - 在 dev-share-web 中展示

**核心价值**：
- 🎯 代码复用最大化
- 🛠️ 维护成本最低
- 🚀 开发效率提升
- 📦 统一的开发者体验

