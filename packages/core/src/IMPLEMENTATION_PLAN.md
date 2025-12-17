# SDK 实施计划（基于 Proto 文件）

## 📋 实施原则

1. **先检查 proto 文件**：所有实现必须基于后端 proto 文件
2. **复用现有代码**：将 table-plan-web 和 dev-share-web 中已实现的代码迁移到 SDK
3. **统一管理**：所有业务都使用 SDK 的方法

## 🔍 Proto 文件检查清单

### ✅ 已检查的 Proto 文件

1. ✅ `passport-service/api/passport/v1/passport.proto`
   - 路径：`/v1/auth/*`, `/v1/users/*`
   - 主要方法：Register, Login, SendCaptcha, GetUser, ListUsers, UpdateProfile, ResetPassword, ValidateToken

2. ✅ `asset-service/api/asset/v1/asset.proto`
   - 路径：`/api/v1/files/*`
   - 主要方法：UploadFile, GetFileInfo, GetFileURL, DeleteFile, ListFiles

3. ✅ `notification-service/api/notification/v1/notification.proto`
   - 路径：`/v1/notification/*`
   - 主要方法：Send, BatchSend, GetStatus, GetHistory, SaveTemplate, ListTemplates

4. ✅ `subscription-service/api/subscription/v1/subscription.proto`
   - 路径：`/v1/subscription/*`
   - 主要方法：ListPlans, CreatePlan, UpdatePlan, CreateSubscriptionOrder, GetMySubscription

5. ✅ `payment-service/api/payment/v1/payment.proto`
   - 路径：`/v1/payment/*`, `/v1/revenue/*`
   - 主要方法：CreatePayment, GetPayment, GetRevenueStats, GetAppRevenueStats, ListTransactions

6. ✅ `marketing-service/api/marketing_service/v1/marketing.proto`
   - 路径：`/v1/coupons/*`
   - 主要方法：CreateCoupon, GetCoupon, ListCoupons, UpdateCoupon, DeleteCoupon, ValidateCoupon, UseCoupon

7. ✅ `api-key-service/api/api_key_service/v1/api_key.proto`
   - 路径：`/api/v1/api-keys/*`, `/api/v1/apps/*`
   - 主要方法：CreateKey, GetKey, DeleteKey, CreateApp, ListApps, GetApp, UpdateApp, DeleteApp
   - ⚠️ 注意：此服务不在核心 SDK 中，后续按需添加

8. ✅ `short-link-service/api/short_link/v1/short_link.proto`
   - 路径：`/api/v1/short-link/*`
   - 主要方法：CreateShortLink, GetShortLink, ListShortLinks, GetShortLinkStats
   - ✅ 已实现

## 📦 现有代码检查

### table-plan-web 中的实现

1. ✅ `src/lib/api/core/passport-fetch.ts` - Passport API 客户端
2. ✅ `src/lib/api/core/notification-fetch.ts` - Notification API 客户端
3. ✅ `src/lib/api/core/subscription-fetch.ts` - Subscription API 客户端
4. ✅ `src/lib/api/core/fetch.ts` - 通用 API 客户端

### dev-share-web 中的实现

1. ✅ `lib/api/passport.ts` - Passport API 客户端（完整实现）
2. ✅ `lib/api/asset.ts` - Asset API 客户端（需要查找）
3. ✅ `lib/api/notification.ts` - Notification API 客户端（完整实现）
4. ✅ `lib/api/subscription.ts` - Subscription API 客户端（完整实现）
5. ✅ `lib/api/payment.ts` - Payment API 客户端（完整实现）
6. ✅ `lib/api/marketing.ts` - Marketing API 客户端（完整实现）
7. ✅ `lib/api/app.ts` - App API 客户端（完整实现）
8. ✅ `lib/api/client.ts` - HTTP 客户端（完整实现）
9. ✅ `lib/api/types.ts` - 类型定义（完整实现）

## 🚀 实施步骤

### 阶段 1：创建基础文件（基于 dev-share-web）

1. **`types.ts`** - 类型定义
   - 参考：`dev-share-web/lib/api/types.ts`
   - 基于 proto 文件定义所有类型

2. **`client.ts`** - HTTP 客户端
   - 参考：`dev-share-web/lib/api/client.ts`
   - 适配 SDK 配置系统（`SDKConfig`）
   - 实现 `RequestClient` 和 `AuthManager`

3. **`utils.ts`** - 工具函数
   - JWT 解析（`parseUserIdFromToken`, `getUserIdFromToken`）
   - 用户缓存管理（`saveUserCache`, `clearUserCache`, `validateAndGetCachedUser`）
   - 错误解析（`parseError`）
   - Token 检查（`checkHasToken`）

### 阶段 2：创建服务文件（基于 proto 和 dev-share-web）

1. **`services/passport.ts`**
   - 参考：`dev-share-web/lib/api/passport.ts`
   - 基于：`passport-service/api/passport/v1/passport.proto`

2. **`services/asset.ts`**
   - 参考：编译后的代码 `dist/index.d.ts`
   - 基于：`asset-service/api/asset/v1/asset.proto`

3. **`services/notification.ts`**
   - 参考：`dev-share-web/lib/api/notification.ts`
   - 基于：`notification-service/api/notification/v1/notification.proto`

4. **`services/subscription.ts`**
   - 参考：`dev-share-web/lib/api/subscription.ts`
   - 基于：`subscription-service/api/subscription/v1/subscription.proto`

5. **`services/payment.ts`**
   - 参考：`dev-share-web/lib/api/payment.ts`
   - 基于：`payment-service/api/payment/v1/payment.proto`

6. **`services/marketing.ts`**
   - 参考：`dev-share-web/lib/api/marketing.ts`
   - 基于：`marketing-service/api/marketing_service/v1/marketing.proto`

7. **`services/app.ts`**
   - 参考：`dev-share-web/lib/api/app.ts`
   - 基于：`api-key-service/api/api_key_service/v1/api_key.proto`（App 管理部分）

### 阶段 3：迁移 table-plan-web 代码 ✅

1. ✅ 更新 `table-plan-web` 使用 SDK
   - ✅ 创建 `src/lib/sdk.ts` SDK 初始化文件
   - ✅ 迁移 `src/lib/api/auth.ts` 使用 SDK
   - ✅ 迁移 `src/lib/api/notification.ts` 使用 SDK
   - ✅ 迁移 `src/lib/api/subscription.ts` 使用 SDK
2. ✅ 移除 `table-plan-web/src/lib/api/core/passport-fetch.ts` 等文件
   - ✅ 删除 `passport-fetch.ts`
   - ✅ 删除 `notification-fetch.ts`
   - ✅ 删除 `subscription-fetch.ts`
3. ✅ 替换为 SDK 调用
   - ✅ 处理类型兼容性问题（uid ↔ userId，timestamp ↔ string）
   - ✅ 添加字段名转换逻辑

## 📝 注意事项

1. **路径映射**：
   - Passport: `/v1/auth/*`, `/v1/users/*`
   - Asset: `/api/v1/files/*`
   - Notification: `/v1/notification/*`
   - Subscription: `/v1/subscription/*`
   - Payment: `/v1/payment/*`, `/v1/revenue/*`
   - Marketing: `/v1/coupons/*`
   - App: `/api/v1/apps/*`
   - Short Link: `/api/v1/short-link/*`

2. **appId 传递方式**：
   - 通过 Query String 传递（`?appId=xxx`）
   - 不再使用 Header（`X-App-Id`）

3. **统一响应格式**：
   - 所有服务都使用统一响应格式：`{ success, data, errorCode, errorMessage, showType, traceId, host }`

4. **类型定义**：
   - 所有类型必须与 proto 文件保持一致
   - 字段名使用 camelCase（proto 中的 snake_case 需要转换）

## 🔄 下一步

1. 创建 `types.ts`（基于 dev-share-web/lib/api/types.ts）
2. 创建 `client.ts`（基于 dev-share-web/lib/api/client.ts，适配 SDK）
3. 创建 `utils.ts`（基于编译后的代码和 dev-share-web）
4. 创建各个服务文件（基于 proto 和 dev-share-web 的实现）
