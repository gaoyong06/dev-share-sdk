# Proto 文件分析总结

## ✅ 已检查的 Proto 文件

### 1. Passport Service (`passport-service/api/passport/v1/passport.proto`)

**路径前缀**：`/v1/auth/*`, `/v1/users/*`, `/v1/geoip/*`

**主要 RPC 方法**：
- `Register` - POST `/v1/auth/register`
- `Login` - POST `/v1/auth/login`
- `Logout` - POST `/v1/auth/logout`
- `SendCaptcha` - POST `/v1/auth/captcha`
- `VerifyCaptcha` - POST `/v1/auth/captcha/verify`
- `ResetPassword` - POST `/v1/auth/password/reset`
- `ValidateToken` - POST `/v1/auth/token/validate`
- `CreateGuest` - POST `/v1/auth/guest`
- `GetUser` - GET `/v1/users/{userId}`
- `BatchGetUsers` - POST `/v1/users/batch`
- `ListUsers` - GET `/v1/users`
- `GetUserStats` - GET `/v1/users/stats`
- `UpdateProfile` - PUT `/v1/users/{userId}`
- `UpdateUserStatus` - PUT `/v1/users/{userId}/status`
- `AddToBlacklist` - POST `/v1/users/{userId}/blacklist`
- `RemoveFromBlacklist` - DELETE `/v1/users/{userId}/blacklist`
- `BatchAddToBlacklist` - POST `/v1/users/blacklist/batch`
- `GetLocationByIP` - POST `/v1/geoip/location`

**关键类型**：
- `RegisterRequest`, `LoginRequest`, `TokenResponse`, `UserResponse`
- `ListUsersRequest`, `ListUsersReply`, `UserStatsReply`
- `UpdateProfileRequest`, `UpdateUserStatusRequest`
- `AddToBlacklistRequest`, `BatchAddToBlacklistRequest`, `BatchAddToBlacklistReply`

### 2. Asset Service (`asset-service/api/asset/v1/asset.proto`)

**路径前缀**：`/api/v1/files/*`

**主要 RPC 方法**：
- `UploadFile` - POST `/api/v1/files` (FormData)
- `DownloadFile` - GET `/api/v1/files/{fileId}/content`
- `GetFileInfo` - GET `/api/v1/files/{fileId}`
- `GetFileURL` - GET `/api/v1/files/{fileId}/url`
- `DeleteFile` - DELETE `/api/v1/files/{fileId}`
- `ListFiles` - GET `/api/v1/files`

**关键类型**：
- `UploadFileRequest`, `UploadFileReply`
- `GetFileInfoRequest`, `GetFileInfoReply`
- `GetFileURLRequest`, `GetFileURLReply`
- `ListFilesRequest`, `ListFilesReply`, `FileInfo`

**注意**：上传文件需要使用 FormData，不是 JSON

### 3. Notification Service (`notification-service/api/notification/v1/notification.proto`)

**路径前缀**：`/v1/notification/*`

**主要 RPC 方法**：
- `Send` - POST `/v1/notification/send`
- `BatchSend` - POST `/v1/notification/batch-send`
- `GetStatus` - GET `/v1/notification/status/{notificationId}`
- `GetHistory` - GET `/v1/notification/history/{userId}`
- `SaveTemplate` - POST `/v1/notification/template`
- `ListTemplates` - GET `/v1/notification/templates`
- `SetUserPreference` - POST `/v1/notification/preference`
- `GetUserPreference` - GET `/v1/notification/preference/{userId}`

**关键类型**：
- `SendRequest`, `SendReply`, `ChannelResult`
- `BatchSendRequest`, `BatchSendReply`, `BatchSendResult`
- `GetStatusRequest`, `GetStatusReply`
- `GetHistoryRequest`, `GetHistoryReply`, `NotificationRecord`
- `SaveTemplateRequest`, `SaveTemplateReply`
- `ListTemplatesRequest`, `ListTemplatesReply`, `Template`
- `SetUserPreferenceRequest`, `SetUserPreferenceReply`
- `GetUserPreferenceRequest`, `GetUserPreferenceReply`

### 4. Subscription Service (`subscription-service/api/subscription/v1/subscription.proto`)

**路径前缀**：`/v1/subscription/*`

**主要 RPC 方法**：
- `ListPlans` - GET `/v1/subscription/plans?appId=xxx`
- `CreatePlan` - POST `/v1/subscription/plans?appId=xxx`
- `UpdatePlan` - PUT `/v1/subscription/plans/{planId}`
- `DeletePlan` - DELETE `/v1/subscription/plans/{planId}`
- `ListPlanPricings` - GET `/v1/subscription/plans/{planId}/pricings`
- `CreatePlanPricing` - POST `/v1/subscription/plans/{planId}/pricings`
- `UpdatePlanPricing` - PUT `/v1/subscription/pricings/{planPricingId}`
- `DeletePlanPricing` - DELETE `/v1/subscription/pricings/{planPricingId}`
- `GetMySubscription` - GET `/v1/subscription/my/{userId}`
- `CreateSubscriptionOrder` - POST `/v1/subscription/order`
- `CancelSubscription` - POST `/v1/subscription/cancel`
- `PauseSubscription` - POST `/v1/subscription/pause`
- `ResumeSubscription` - POST `/v1/subscription/resume`
- `GetSubscriptionHistory` - GET `/v1/subscription/history/{userId}`
- `SetAutoRenew` - POST `/v1/subscription/auto-renew`
- `ListSubscriptionOrders` - GET `/v1/subscription/orders?appId=xxx`
- `GetSubscriptionOrder` - GET `/v1/subscription/orders/{orderId}`
- `ListAppSubscriptions` - GET `/v1/subscription/app/subscriptions?appId=xxx`
- `GetAppSubscriptionHistory` - GET `/v1/subscription/app/history?appId=xxx`

**关键类型**：
- `Plan`, `PlanPricing`
- `ListPlansRequest`, `ListPlansReply`
- `CreatePlanRequest`, `CreatePlanReply`
- `UpdatePlanRequest`, `UpdatePlanReply`
- `CreatePlanPricingRequest`, `CreatePlanPricingReply`
- `UpdatePlanPricingRequest`, `UpdatePlanPricingReply`
- `CreateSubscriptionOrderRequest`, `CreateSubscriptionOrderReply`
- `SubscriptionOrderInfo`, `ListSubscriptionOrdersRequest`, `ListSubscriptionOrdersReply`
- `AppSubscriptionInfo`, `ListAppSubscriptionsRequest`, `ListAppSubscriptionsReply`
- `SubscriptionHistoryItem`, `GetAppSubscriptionHistoryRequest`, `GetAppSubscriptionHistoryReply`

### 5. Payment Service (`payment-service/api/payment/v1/payment.proto`)

**路径前缀**：`/v1/payment/*`, `/v1/revenue/*`

**主要 RPC 方法**：
- `CreatePayment` - POST `/v1/payment/create`
- `GetPayment` - GET `/v1/payment/{paymentId}` 或 GET `/v1/payment/query?orderId=xxx`
- `RefundPayment` - POST `/v1/payment/refund`
- `HandleChannelNotify` - POST `/v1/payment/notify/{channel}`
- `ListPaymentNotifies` - GET `/v1/payment-notifications/{orderId}` 或 GET `/v1/payment-notifications`
- `GetRevenueStats` - GET `/v1/revenue/stats?appId=xxx`
- `GetAppRevenueStats` - GET `/v1/revenue/app?appId=xxx`
- `ListTransactions` - GET `/v1/transactions?appId=xxx`

**关键类型**：
- `CreatePaymentRequest`, `CreatePaymentReply`
- `GetPaymentRequest`, `GetPaymentReply`
- `RefundPaymentRequest`, `RefundPaymentReply`
- `RevenueStatsReply`, `GetRevenueStatsRequest`
- `AppRevenueStatsReply`, `GetAppRevenueStatsRequest`
- `ListTransactionsRequest`, `ListTransactionsReply`, `TransactionRecord`

**枚举类型**：
- `PaymentMethod`: ALIPAY, WECHATPAY, STRIPE, PAYPAL, APPLEPAY, GOOGLEPAY
- `PaymentStatus`: PENDING, SUCCESS, FAILED, CLOSED, REFUNDED, PARTIALLY_REFUNDED
- `PaymentChannel`: ALIPAY, WECHATPAY, STRIPE, PAYPAL, APPLEPAY, GOOGLEPAY

### 6. Marketing Service (`marketing-service/api/marketing_service/v1/marketing.proto`)

**路径前缀**：`/v1/coupons/*`

**主要 RPC 方法**：
- `CreateCoupon` - POST `/v1/coupons?appId=xxx`
- `GetCoupon` - GET `/v1/coupons/{couponCode}`
- `ListCoupons` - GET `/v1/coupons?appId=xxx`
- `UpdateCoupon` - PUT `/v1/coupons/{couponCode}`
- `DeleteCoupon` - DELETE `/v1/coupons/{couponCode}`
- `ValidateCoupon` - POST `/v1/coupons/validate`
- `UseCoupon` - POST `/v1/coupons/use`
- `GetCouponStats` - GET `/v1/coupons/{couponCode}/stats`
- `ListCouponUsages` - GET `/v1/coupons/{couponCode}/usages`
- `GetCouponsSummaryStats` - GET `/v1/coupons/summary-stats?appId=xxx`

**关键类型**：
- `Coupon`
- `CreateCouponRequest`, `CreateCouponReply`
- `GetCouponRequest`, `GetCouponReply`
- `ListCouponsRequest`, `ListCouponsReply`
- `UpdateCouponRequest`, `UpdateCouponReply`
- `ValidateCouponRequest`, `ValidateCouponReply`
- `UseCouponRequest`, `UseCouponReply`
- `GetCouponStatsRequest`, `GetCouponStatsReply`, `CouponStats`
- `CouponUsage`, `ListCouponUsagesRequest`, `ListCouponUsagesReply`
- `GetCouponsSummaryStatsRequest`, `GetCouponsSummaryStatsReply`

### 7. API Key Service - App Management (`api-key-service/api/api_key_service/v1/api_key.proto`)

**路径前缀**：`/api/v1/apps/*`

**主要 RPC 方法**（App 管理部分）：
- `CreateApp` - POST `/api/v1/apps`
- `ListApps` - GET `/api/v1/apps?user_id=xxx`
- `GetApp` - GET `/api/v1/apps/{appId}`
- `UpdateApp` - PUT `/api/v1/apps/{appId}`
- `DeleteApp` - DELETE `/api/v1/apps/{appId}`

**关键类型**：
- `CreateAppRequest`, `CreateAppReply`
- `ListAppsRequest`, `ListAppsReply`
- `GetAppRequest`, `GetAppReply`
- `UpdateAppRequest`, `UpdateAppReply`
- `DeleteAppRequest`, `DeleteAppReply`
- `AppInfo`

**注意**：API Key 管理部分（CreateKey, GetKey, DeleteKey）不在核心 SDK 中

### 8. Short Link Service (`short-link-service/api/short_link/v1/short_link.proto`)

**路径前缀**：`/api/v1/short-link/*`

**状态**：✅ 已实现

## 📝 实施注意事项

1. **appId 传递方式**：
   - 通过 Query String 传递（`?appId=xxx`）
   - 不再使用 Header（`X-App-Id`）

2. **统一响应格式**：
   - 所有服务都使用统一响应格式：`{ success, data, errorCode, errorMessage, showType, traceId, host }`

3. **类型转换**：
   - Proto 中的 `snake_case` 需要转换为 TypeScript 的 `camelCase`
   - 例如：`user_id` → `userId`, `created_at` → `createdAt`

4. **文件上传**：
   - Asset Service 的 `UploadFile` 需要使用 FormData，不是 JSON

5. **枚举类型**：
   - Payment Service 中的枚举需要转换为 TypeScript 的联合类型或枚举

6. **时间戳**：
   - Proto 中的 `int64` 时间戳需要转换为 TypeScript 的 `number` 或 `string`

7. **可选字段**：
   - Proto 中的可选字段在 TypeScript 中使用 `?` 标记

## 🔄 下一步

基于 proto 文件和 dev-share-web 的实现，创建 SDK 的服务文件。
