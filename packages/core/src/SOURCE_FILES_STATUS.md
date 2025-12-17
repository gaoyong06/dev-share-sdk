# SDK 源代码文件状态

## 📁 目录结构

```
dev-share-sdk/packages/core/src/
├── index.ts                    ✅ 已创建（主 SDK 类）
├── client.ts                   ⏳ 待创建（HTTP 客户端）
├── types.ts                    ⏳ 待创建（类型定义）
├── utils.ts                    ⏳ 待创建（工具函数）
└── services/
    ├── passport.ts             ⏳ 待创建（Passport 服务）
    ├── asset.ts                ⏳ 待创建（Asset 服务）
    ├── notification.ts         ⏳ 待创建（Notification 服务）
    ├── subscription.ts         ⏳ 待创建（Subscription 服务）
    ├── payment.ts              ⏳ 待创建（Payment 服务）
    ├── marketing.ts            ⏳ 待创建（Marketing 服务）
    ├── app.ts                  ⏳ 待创建（App 服务）
    └── short-link.ts           ✅ 已创建（Short Link 服务）
```

## 📋 文件说明

### 已创建的文件
1. ✅ `index.ts` - 主 SDK 类，包含所有服务的初始化
2. ✅ `services/short-link.ts` - 短链接服务实现

### 待创建的文件

#### 基础文件
1. **`client.ts`** - HTTP 客户端
   - 参考：`dev-share-web/lib/api/client.ts`
   - 需要适配 SDK 的配置系统（`SDKConfig`）
   - 包含 `RequestClient` 类和 `AuthManager` 类

2. **`types.ts`** - 类型定义
   - 参考：`dev-share-web/lib/api/types.ts`
   - 包含所有服务的类型定义
   - 包含 `SDKConfig`、`ApiResponse`、`ApiError` 等

3. **`utils.ts`** - 工具函数
   - JWT 解析函数（`parseUserIdFromToken`、`getUserIdFromToken`）
   - 用户缓存管理（`saveUserCache`、`clearUserCache`、`validateAndGetCachedUser`）
   - 错误解析（`parseError`）
   - Token 检查（`checkHasToken`）

#### 服务文件
所有服务文件都需要：
- 导入 `RequestClient` 和类型定义
- 实现对应的服务类
- 导出服务类和类型

1. **`services/passport.ts`** - Passport 服务
   - 参考：`dev-share-web/lib/api/passport.ts`
   - 实现 `PassportService` 类

2. **`services/asset.ts`** - Asset 服务
   - 参考：编译后的代码 `dist/index.d.ts` 中的 `AssetService`
   - 实现 `AssetService` 类

3. **`services/notification.ts`** - Notification 服务
   - 参考：`dev-share-web/lib/api/notification.ts`
   - 实现 `NotificationService` 类

4. **`services/subscription.ts`** - Subscription 服务
   - 参考：`dev-share-web/lib/api/subscription.ts`
   - 实现 `SubscriptionService` 类

5. **`services/payment.ts`** - Payment 服务
   - 参考：`dev-share-web/lib/api/payment.ts`
   - 实现 `PaymentService` 类

6. **`services/marketing.ts`** - Marketing 服务
   - 参考：`dev-share-web/lib/api/marketing.ts`
   - 实现 `MarketingService` 类

7. **`services/app.ts`** - App 服务
   - 参考：`dev-share-web/lib/api/app.ts`
   - 实现 `AppService` 类

## 🔧 创建顺序建议

1. 先创建基础文件（`types.ts`、`client.ts`、`utils.ts`）
2. 然后创建各个服务文件
3. 最后验证 `index.ts` 的导入是否正确

## 📝 注意事项

- 所有服务类都需要接收 `RequestClient` 实例作为构造函数参数
- `PassportService` 和 `PaymentService` 需要 `defaultAppId` 参数
- 类型定义需要与后端 proto 文件保持一致
- HTTP 客户端需要支持 SDK 的配置系统（`SDKConfig`）
