# AtSeeker SDK

统一的公共服务 JavaScript/TypeScript SDK

## 📦 包结构

```
dev-share-sdk/
├── packages/
│   ├── core/              # 核心 SDK（@atseeker/sdk）
│   └── react/             # React Hooks 扩展（可选，待实现）
└── README.md
```

## 🚀 快速开始

### 安装

```bash
cd packages/core
npm install
npm run build
```

### 使用

```typescript
import { AtSeekerSDK } from '@atseeker/sdk'

const sdk = new AtSeekerSDK({
  baseURL: 'https://api.atseeker.com',
  apiKey: 'your-api-key',
})

// 使用服务
const result = await sdk.passport.login({
  contactType: 'email',
  contact: 'user@example.com',
  password: 'password123',
})
```

## 📚 文档

详细文档请参考 [packages/core/README.md](./packages/core/README.md)

## 🏗️ 架构设计

SDK 采用统一架构，同时满足内部项目和外部开发者使用：

- **核心 SDK** (`@atseeker/sdk`): 提供所有公共服务 API
- **配置系统**: 通过配置区分内部/外部使用场景
- **服务模块化**: 每个服务独立封装，易于扩展

## 🔧 开发

### 构建

```bash
cd packages/core
npm run build
```

### 开发模式

```bash
npm run dev
```

## 📝 迁移指南

### 从现有项目迁移到 SDK

1. **安装 SDK**
   ```bash
   npm install @atseeker/sdk
   ```

2. **替换 API 调用**
   ```typescript
   // 之前
   import { passportApi } from '@/lib/api'
   await passportApi.login(...)
   
   // 之后
   import { AtSeekerSDK } from '@atseeker/sdk'
   const sdk = new AtSeekerSDK(config)
   await sdk.passport.login(...)
   ```

3. **更新类型导入**
   ```typescript
   // 之前
   import type { UserInfo } from '@/lib/api/types'
   
   // 之后
   import type { UserInfo } from '@atseeker/sdk'
   ```

## � 发布指南

本仓库包含两个主要的 SDK 包，发布流程如下：

### 1. 登录npm
```
npm login
```

### 1. 核心 SDK (@atseeker/sdk)

位于 `packages/core` 目录，提供所有公共服务 API。

```bash
# 进入目录
cd packages/core

# 自动升级版本号并发布 (确保已登录 npm)
npm run release
```

- npm 地址: [https://www.npmjs.com/package/@atseeker/sdk](https://www.npmjs.com/package/@atseeker/sdk)

### 2. 分析 SDK (@atseeker/analytics-sdk)

位于 `analytics-sdk-js` 目录，专为数据分析设计的轻量级 SDK。

```bash
# 进入目录
cd analytics-sdk-js

# 自动升级版本号并发布 (确保已登录 npm)
npm run release
```

- npm 地址: [https://www.npmjs.com/package/@atseeker/analytics-sdk](https://www.npmjs.com/package/@atseeker/analytics-sdk)

## �� License

MIT

