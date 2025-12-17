# SDK 迁移状态

## ✅ 已完成的工作

### 1. SDK 创建
- ✅ 创建了完整的 SDK 结构 (`dev-share-sdk/packages/core`)
- ✅ 实现了所有公共服务 API（Passport, Asset, Notification, Subscription, Billing）
- ✅ 实现了 HTTP 客户端和错误处理
- ✅ 实现了工具函数（JWT 解析、用户缓存管理）
- ✅ 构建成功，生成了 ESM 和 CommonJS 格式

### 2. question-hub-web 迁移
- ✅ 安装了 SDK（使用 file: 协议）
- ✅ 创建了 SDK 实例文件 (`lib/sdk.ts`)
- ✅ 替换了所有 API 调用：
  - `components/auth/auth-form.tsx` - Passport API
  - `app/reset-password/page.tsx` - Passport API
  - `app/dashboard/questions/upload/page.tsx` - Asset API

## ⚠️ 遇到的问题

### Next.js Turbopack 无法解析本地包

**问题描述**：
Next.js 16.0.3 使用 Turbopack 作为构建工具，无法解析通过 `file:` 协议安装的本地包。

**错误信息**：
```
Module not found: Can't resolve '@atseeker/sdk'
```

**原因**：
- Turbopack 对本地包的支持有限
- `file:` 协议的包在构建时可能无法正确解析

## 🔧 解决方案

### 方案 1: 发布到 npm（推荐）
```bash
cd dev-share-sdk/packages/core
npm publish --access public
```

然后在项目中安装：
```bash
npm install @atseeker/sdk
```

### 方案 2: 使用 npm link（开发环境）
```bash
# 在 SDK 目录
cd dev-share-sdk/packages/core
npm link

# 在项目目录
cd question-hub-web
npm link @atseeker/sdk
```

### 方案 3: 使用相对路径导入（临时方案）
```typescript
// lib/sdk.ts
import { AtSeekerSDK } from '../../dev-share-sdk/packages/core/src/index'
```

**注意**：需要配置 TypeScript 路径别名或确保路径正确。

### 方案 4: 禁用 Turbopack（临时方案）
在 `next.config.mjs` 中禁用 Turbopack：
```javascript
const nextConfig = {
  // 禁用 Turbopack，使用 webpack
  experimental: {
    turbo: false,
  },
}
```

## 📋 下一步计划

1. **短期**（开发环境）：
   - 使用方案 2（npm link）或方案 3（相对路径）
   - 继续测试 SDK 功能

2. **中期**（内部使用）：
   - 设置私有 npm registry
   - 或使用 monorepo 工具（如 pnpm workspace）

3. **长期**（对外发布）：
   - 发布到公共 npm
   - 完善文档和示例

## 📝 迁移检查清单

### question-hub-web
- [x] 安装 SDK
- [x] 创建 SDK 实例
- [x] 替换 Passport API 调用
- [x] 替换 Asset API 调用
- [ ] 解决构建问题（Next.js Turbopack）
- [ ] 测试功能
- [ ] 删除旧的 API 文件

### dev-share-web
- [ ] 安装 SDK
- [ ] 创建 SDK 实例
- [ ] 替换 API 调用
- [ ] 测试功能

## 🎯 建议

1. **优先解决构建问题**：使用 npm link 或相对路径导入
2. **测试功能**：确保所有 API 调用正常工作
3. **逐步迁移**：先完成一个项目的完整迁移，再迁移其他项目
4. **文档更新**：更新项目文档，说明 SDK 的使用方法

