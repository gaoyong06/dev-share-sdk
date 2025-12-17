/**
 * 通用类型定义
 */
interface ApiError {
    code: number;
    message: string;
    details?: unknown;
}
interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
}

interface SDKConfig {
    baseURL?: string;
    apiKey?: string;
    appId?: string;
    tokenStorage?: 'localStorage' | 'sessionStorage' | 'memory' | 'custom';
    tokenKey?: string;
    customTokenGetter?: () => string | null;
    customTokenSetter?: (token: string) => void;
    timeout?: number;
    retry?: number;
    useProxy?: boolean;
    apiProxy?: string;
    internal?: {
        enableUserCache?: boolean;
        enableMetrics?: boolean;
    };
}

/**
 * Passport Service 类型定义
 */
interface RegisterRequest {
    nickname: string;
    password: string;
    contactType: 'phone' | 'email';
    contact: string;
    captcha: string;
    visitorId?: string;
}
interface LoginRequest {
    contactType: 'phone' | 'email';
    contact: string;
    password: string;
    captcha?: string;
}
interface TokenResponse {
    accessToken: string;
    expiresIn: string | number;
    tokenType: string;
}
interface UserResponse {
    userId: string;
    nickname: string;
    avatar: string;
    email: string;
    phone: string;
    signature: string;
    title: string;
    isoCode: string;
    countryName: string;
    provinceName: string;
    cityName: string;
    language: string;
    timezone: string;
    role: string;
    isActive: boolean;
    isRegistered: boolean;
    isBlacklisted?: boolean;
    blacklistedAt?: string;
    blacklistedReason?: string;
    createdAt: string;
    appId: string;
}
type UserInfo = UserResponse;
interface CaptchaRequest {
    contactType: 'phone' | 'email';
    contact: string;
    scene: 'captcha_register' | 'captcha_login' | 'captcha_reset_password';
}
interface ResetPasswordRequest {
    contactType: 'phone' | 'email';
    contact: string;
    captcha: string;
    newPassword: string;
}
interface ValidateTokenRequest {
    token: string;
}
interface UserClaims {
    userId: string;
    role: string;
}
interface UpdateProfileRequest {
    userId: string;
    nickname?: string;
    avatar?: string;
    signature?: string;
    title?: string;
    isoCode?: string;
    countryName?: string;
    provinceName?: string;
    cityName?: string;
    language?: string;
    timezone?: string;
}
interface ListUsersRequest {
    page?: number;
    pageSize?: number;
    search?: string;
}
interface ListUsersReply {
    users: UserInfo[];
    total: number;
    page: number;
    pageSize: number;
}
interface UserStatsReply {
    totalUsers: number;
    monthlyActiveUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
}
interface BatchGetUserRequest {
    userIds: string[];
}
interface BatchUserResponse {
    users: Record<string, UserResponse>;
}
interface LogoutRequest {
    token: string;
}
interface CreateGuestRequest {
    visitorId?: string;
}
interface GuestResponse {
    accessToken: string;
    expiresIn: number;
    tokenType: string;
    user: UserResponse;
}
interface UpdateUserStatusRequest {
    userId: string;
    isActive: boolean;
}
interface AddToBlacklistRequest {
    userId: string;
    reason?: string;
}
interface RemoveFromBlacklistRequest {
    userId: string;
}
interface BatchAddToBlacklistRequest {
    userIds: string[];
    reason?: string;
}
interface BatchAddToBlacklistReply {
    successCount: number;
    totalCount: number;
}
interface GetLocationByIPRequest {
    ip: string;
}
interface LocationResponse {
    ip: string;
    isoCode: string;
    country: string;
    province: string;
    city: string;
    postal: string;
    timezone: string;
    latitude: number;
    longitude: number;
}

/**
 * Asset Service 类型定义
 */
interface UploadFileResponse {
    fileId: string;
    name: string;
    size: number;
    contentType: string;
    type: string;
    storageType: string;
    storagePath: string;
    hash: string;
    uploadedBy: string;
    createdAt: string;
    metadata?: Record<string, string>;
}
interface GetFileInfoReply {
    fileId: string;
    name: string;
    size: number;
    contentType: string;
    type: string;
    storageType: string;
    storagePath: string;
    hash: string;
    uploadedBy: string;
    createdAt: string;
    updatedAt: string;
    metadata?: Record<string, string>;
    isPublic: boolean;
}
interface GetFileURLReply {
    url: string;
    expireAt: number;
}
interface DeleteFileReply {
    success: boolean;
}
interface FileInfo {
    fileId: string;
    name: string;
    size: number;
    contentType: string;
    type: string;
    createdAt: string;
    url: string;
}
interface ListFilesReply {
    files: FileInfo[];
    total: number;
}

/**
 * Notification Service 类型定义
 */
interface SendNotificationRequest {
    userId: string;
    templateId: string;
    channels?: string[];
    params?: Record<string, string>;
    priority?: number;
    async?: boolean;
    recipient?: string;
    locale?: string;
}
interface SendNotificationReply {
    notificationId: string;
    status: string;
    channelResults?: Record<string, ChannelResult>;
    message: string;
}
interface ChannelResult {
    success: boolean;
    message: string;
    provider: string;
}
interface BatchSendRequest {
    userIds: string[];
    templateId: string;
    channels?: string[];
    params?: Record<string, string>;
    priority?: number;
}
interface BatchSendReply {
    total: number;
    success: number;
    failed: number;
    results: BatchSendResult[];
}
interface BatchSendResult {
    userId: string;
    success: boolean;
    notificationId?: string;
    errorMessage?: string;
}
interface GetStatusReply {
    notificationId: string;
    userId: string;
    templateId: string;
    channel: string;
    recipient: string;
    status: string;
    errorMessage?: string;
    retryCount: number;
    sentAt: number;
    deliveredAt?: number;
    createdAt: number;
}
interface NotificationRecord {
    notificationId: string;
    userId: string;
    templateId: string;
    channel: string;
    recipient: string;
    status: string;
    content: string;
    createdAt: number;
    sentAt?: number;
}
interface GetHistoryReply {
    records: NotificationRecord[];
    total: number;
    page: number;
    pageSize: number;
}
interface SaveTemplateRequest {
    id: string;
    name: string;
    channel: 'sms' | 'email' | 'push' | 'inapp';
    subject?: string;
    content: string;
    params?: Record<string, string>;
    locale?: string;
    is_active?: boolean;
}
interface SaveTemplateReply {
    success: boolean;
    message: string;
}
interface ListTemplatesRequest {
    channel?: string;
    locale?: string;
    page?: number;
    pageSize?: number;
}
interface Template {
    id: string;
    name: string;
    channel: string;
    subject?: string;
    content: string;
    locale: string;
    version: number;
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
}
interface ListTemplatesReply {
    templates: Template[];
    total: number;
}
interface SetUserPreferenceRequest {
    userId: string;
    preferences: Record<string, ChannelPreference>;
}
interface ChannelPreference {
    channels: string[];
    enabled: boolean;
}
interface SetUserPreferenceReply {
    success: boolean;
    message: string;
}
interface GetUserPreferenceReply {
    userId: string;
    preferences: Record<string, ChannelPreference>;
    createdAt: number;
    updatedAt: number;
}

/**
 * Subscription Service 类型定义
 */
interface Plan {
    planId: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    durationDays: number;
    type: string;
    appId: string;
}
interface PlanPricing {
    planPricingId: number;
    planId: string;
    countryCode: string;
    price: number;
    currency: string;
}
interface ListPlansReply {
    plans: Plan[];
}
interface CreatePlanRequest {
    name: string;
    description?: string;
    price: number;
    currency: string;
    durationDays: number;
    type: string;
}
interface CreatePlanReply {
    plan: Plan;
}
interface UpdatePlanRequest {
    planId: string;
    name?: string;
    description?: string;
    price?: number;
    currency?: string;
    durationDays?: number;
    type?: string;
}
interface UpdatePlanReply {
    plan: Plan;
}
interface DeletePlanReply {
    planId: string;
}
interface ListPlanPricingsReply {
    pricings: PlanPricing[];
}
interface CreatePlanPricingRequest {
    planId: string;
    countryCode: string;
    price: number;
    currency: string;
}
interface CreatePlanPricingReply {
    pricing: PlanPricing;
}
interface UpdatePlanPricingRequest {
    planPricingId: number;
    price: number;
    currency: string;
}
interface UpdatePlanPricingReply {
    pricing: PlanPricing;
}
interface DeletePlanPricingRequest {
    planPricingId: number;
}
interface DeletePlanPricingReply {
    planPricingId: number;
}
interface CreateSubscriptionOrderRequest {
    userId: string;
    planId: string;
    paymentMethod: 'alipay' | 'wechatpay';
    region?: string;
}
interface CreateSubscriptionOrderReply {
    orderId: string;
    paymentId: string;
    payUrl: string;
    payCode: string;
    payParams: string;
}
interface SubscriptionOrderInfo {
    orderId: string;
    paymentId: string;
    userId: string;
    planId: string;
    planName?: string;
    appId: string;
    amount: number;
    currency?: string;
    paymentStatus: string;
    createdAt: number;
}
interface ListSubscriptionOrdersRequest {
    appId: string;
    userId?: string;
    planId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
}
interface ListSubscriptionOrdersReply {
    orders: SubscriptionOrderInfo[];
    total: number;
    page: number;
    pageSize: number;
}
interface GetSubscriptionOrderRequest {
    orderId: string;
}
interface GetSubscriptionOrderReply {
    order: SubscriptionOrderInfo;
}
interface AppSubscriptionInfo {
    subscriptionId: number;
    userId: string;
    planId: string;
    planName?: string;
    appId: string;
    startTime: number;
    endTime: number;
    status: string;
    orderId: string;
    autoRenew: boolean;
    createdAt: number;
    updatedAt: number;
}
interface ListAppSubscriptionsRequest {
    appId: string;
    status?: string;
    userId?: string;
    page?: number;
    pageSize?: number;
}
interface ListAppSubscriptionsReply {
    subscriptions: AppSubscriptionInfo[];
    total: number;
    page: number;
    pageSize: number;
}
interface SubscriptionHistoryItem {
    id: number;
    userId: string;
    planId: string;
    planName: string;
    startTime: number;
    endTime: number;
    status: string;
    action: string;
    createdAt: number;
}
interface GetAppSubscriptionHistoryRequest {
    appId: string;
    userId?: string;
    action?: string;
    startTime?: number;
    endTime?: number;
    page?: number;
    pageSize?: number;
}
interface GetAppSubscriptionHistoryReply {
    items: SubscriptionHistoryItem[];
    total: number;
    page: number;
    pageSize: number;
}
interface GetMySubscriptionRequest {
    userId: string;
}
interface GetMySubscriptionReply {
    isActive: boolean;
    planId: string;
    startTime: number;
    endTime: number;
    status: string;
    autoRenew: boolean;
}
interface CancelSubscriptionRequest {
    userId: string;
    reason?: string;
}
interface PauseSubscriptionRequest {
    userId: string;
    reason?: string;
}
interface ResumeSubscriptionRequest {
    userId: string;
}
interface GetSubscriptionHistoryRequest {
    userId: string;
    page?: number;
    pageSize?: number;
}
interface GetSubscriptionHistoryReply {
    items: SubscriptionHistoryItem[];
    total: number;
    page: number;
    pageSize: number;
}
interface SetAutoRenewRequest {
    userId: string;
    autoRenew: boolean;
}

/**
 * Payment Service 类型定义
 */
type PaymentMethod = 'alipay' | 'wechatpay' | 'stripe' | 'paypal' | 'applepay' | 'googlepay';
type PaymentStatus = 'pending' | 'success' | 'failed' | 'closed' | 'refunded' | 'partially_refunded';
interface CreatePaymentRequest {
    orderId: string;
    uid: string;
    source: string;
    amount: number;
    currency: string;
    method: PaymentMethod;
    subject: string;
    returnUrl?: string;
    notifyUrl?: string;
    clientIp?: string;
}
interface CreatePaymentReply {
    paymentId: string;
    status: PaymentStatus;
    payUrl: string;
    payCode: string;
    payParams: string;
}
interface GetPaymentRequest {
    paymentId?: string;
    orderId?: string;
}
interface GetPaymentReply {
    paymentId: string;
    orderId: string;
    uid: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    channelTxnId?: string;
    paidAt?: number;
}
interface RefundPaymentRequest {
    paymentId: string;
    amount: number;
    reason: string;
}
interface RefundPaymentReply {
    refundId: string;
    status: 'success' | 'failed';
}
interface RevenueStats {
    todayRevenue: number;
    monthRevenue: number;
    totalRevenue: number;
    yesterdayRevenue: number;
    lastMonthRevenue: number;
    todayCount: number;
    monthCount: number;
    totalCount: number;
}
interface AppRevenueStats {
    appId: string;
    totalRevenue: number;
    monthRevenue: number;
    todayRevenue: number;
    totalCount: number;
    monthCount: number;
    todayCount: number;
}
interface TransactionRecord {
    paymentId: string;
    orderId: string;
    appId: string;
    uid: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    method: PaymentMethod;
    subject: string;
    paidAt?: number;
    createdAt: number;
}
interface ListTransactionsRequest {
    page?: number;
    pageSize?: number;
    status?: PaymentStatus;
    startTime?: number;
    endTime?: number;
}
interface ListTransactionsReply {
    transactions: TransactionRecord[];
    total: number;
    page: number;
    pageSize: number;
}

/**
 * Marketing Service 类型定义
 */
interface Coupon {
    couponCode: string;
    appId?: string;
    discountType?: 'percent' | 'fixed';
    discountValue?: number;
    currency?: string;
    validFrom?: number;
    validUntil?: number;
    maxUses?: number;
    usedCount?: number;
    minAmount?: number;
    status: 'active' | 'inactive' | 'expired';
    createdAt?: number;
    updatedAt?: number;
}
interface CreateCouponRequest {
    couponCode: string;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    currency?: string;
    validFrom: number;
    validUntil: number;
    maxUses: number;
    minAmount?: number;
}
interface CreateCouponReply {
    coupon: Coupon;
}
interface GetCouponRequest {
    couponCode: string;
}
interface GetCouponReply {
    coupon: Coupon;
}
interface ListCouponsRequest {
    status?: string;
    page?: number;
    pageSize?: number;
}
interface ListCouponsReply {
    coupons: Coupon[];
    total: number;
    page: number;
    pageSize: number;
}
interface UpdateCouponRequest {
    couponCode: string;
    discountType?: 'percent' | 'fixed';
    discountValue?: number;
    currency?: string;
    validFrom?: number;
    validUntil?: number;
    maxUses?: number;
    minAmount?: number;
    status?: string;
}
interface UpdateCouponReply {
    coupon: Coupon;
}
interface DeleteCouponRequest {
    couponCode: string;
}
interface ValidateCouponRequest {
    couponCode: string;
    amount: number;
}
interface ValidateCouponReply {
    valid: boolean;
    message: string;
    discountAmount: number;
    finalAmount: number;
    coupon: Coupon;
}
interface UseCouponRequest {
    couponCode: string;
    appId: string;
    userId: number;
    paymentOrderId: string;
    paymentId: string;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
}
interface UseCouponReply {
    success: boolean;
    message: string;
}
interface CouponStats {
    couponCode: string;
    totalUses: number;
    totalOrders: number;
    totalRevenue: number;
    totalDiscount: number;
    conversionRate: number;
}
interface GetCouponStatsRequest {
    couponCode: string;
}
interface GetCouponStatsReply {
    couponCode: string;
    totalUses: number;
    totalOrders: number;
    totalRevenue: number;
    totalDiscount: number;
    conversionRate: number;
}
interface CouponUsage {
    couponUsageId: string;
    couponCode: string;
    appId: string;
    userId: number;
    paymentOrderId: string;
    paymentId: string;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
    usedAt: number;
}
interface ListCouponUsagesRequest {
    couponCode: string;
    page?: number;
    pageSize?: number;
}
interface ListCouponUsagesReply {
    usages: CouponUsage[];
    total: number;
    page: number;
    pageSize: number;
}
interface CouponsSummaryStats {
    totalCoupons: number;
    activeCoupons: number;
    totalUses: number;
    totalOrders: number;
    totalRevenue: number;
    totalDiscount: number;
    averageConversionRate: number;
    topCoupons: CouponStats[];
}
interface GetCouponsSummaryStatsRequest {
    appId: string;
}
interface GetCouponsSummaryStatsReply {
    totalCoupons: number;
    activeCoupons: number;
    totalUses: number;
    totalOrders: number;
    totalRevenue: number;
    totalDiscount: number;
    averageConversionRate: number;
    topCoupons: CouponStats[];
}

/**
 * App Management 类型定义
 */
interface CreateAppRequest {
    user_id: string;
    appKey?: string;
    appName: string;
    appType: 'web' | 'mobile' | 'desktop' | 'miniprogram';
    websiteUrl?: string;
    packageName?: string;
    miniprogramAppid?: string;
    description?: string;
}
interface CreateAppReply {
    appId: string;
    appKey: string;
    appName: string;
    appType: string;
    createdAt: string;
}
interface AppInfo {
    appId: string;
    appKey: string;
    appName: string;
    appType: string;
    websiteUrl?: string;
    packageName?: string;
    miniprogramAppid?: string;
    description?: string;
    status: 'ACTIVE' | 'SUSPENDED';
    createdAt: string;
    updatedAt: string;
}
interface ListAppsRequest {
    user_id: string;
    page?: number;
    pageSize?: number;
}
interface ListAppsReply {
    apps: AppInfo[];
    total: number;
}
interface GetAppReply {
    app: AppInfo;
}
interface UpdateAppRequest {
    appId: string;
    appName?: string;
    websiteUrl?: string;
    packageName?: string;
    miniprogramAppid?: string;
    description?: string;
}
interface UpdateAppReply {
    success: boolean;
}
interface DeleteAppReply {
    success: boolean;
}

declare class AuthManager {
    private config;
    constructor(config: SDKConfig);
    /**
     * 获取存储的 token
     */
    getToken(): string | null;
    /**
     * 设置 token
     */
    setToken(token: string): void;
    /**
     * 清除 token
     */
    clearToken(): void;
    /**
     * 获取存储对象
     */
    private getStorage;
    /**
     * 内存存储（简单实现）
     */
    private memoryStorage;
    private getMemoryStorage;
}

/**
 * 解析 API 响应中的错误信息
 */
declare function parseError(data: any, status: number): ApiError;

declare class RequestClient {
    private config;
    private authManager;
    constructor(config: SDKConfig);
    /**
     * 通用请求函数
     */
    request<T>(url: string, options?: RequestInit & {
        params?: Record<string, string | number | boolean | undefined>;
        appId?: string;
    }): Promise<ApiResponse<T>>;
    /**
     * GET 请求
     */
    get<T>(url: string, options?: {
        params?: Record<string, string | number | boolean | undefined>;
        appId?: string;
        headers?: HeadersInit;
    }): Promise<ApiResponse<T>>;
    /**
     * POST 请求
     */
    post<T>(url: string, body?: unknown, options?: {
        params?: Record<string, string | number | boolean | undefined>;
        appId?: string;
        headers?: HeadersInit;
    }): Promise<ApiResponse<T>>;
    /**
     * PUT 请求
     */
    put<T>(url: string, body?: unknown, options?: {
        params?: Record<string, string | number | boolean | undefined>;
        appId?: string;
        headers?: HeadersInit;
    }): Promise<ApiResponse<T>>;
    /**
     * DELETE 请求
     */
    delete<T>(url: string, options?: {
        params?: Record<string, string | number | boolean | undefined>;
        appId?: string;
        headers?: HeadersInit;
    }): Promise<ApiResponse<T>>;
    /**
     * 上传文件（FormData）
     */
    uploadFile<T>(url: string, file: File, metadata?: Record<string, string>, options?: {
        appId?: string;
        headers?: HeadersInit;
    }): Promise<ApiResponse<T>>;
}

/**
 * JWT Token 解析工具
 * 从 JWT token 中提取用户信息
 */
/**
 * 解析 JWT token，提取 userId
 * @param token JWT token 字符串
 * @returns userId（字符串 UUID）或 null
 */
declare function parseUserIdFromToken(token: string): string | null;
/**
 * 从存储中获取 access_token 并解析 userId
 * @param tokenGetter 获取 token 的函数（可选，默认从 localStorage）
 * @returns userId（字符串 UUID）或 null
 */
declare function getUserIdFromToken(tokenGetter?: () => string | null): string | null;

/**
 * 用户缓存管理工具
 * 处理用户信息的缓存验证和清理逻辑
 */

interface UserCacheConfig {
    tokenGetter?: () => string | null;
    userGetter?: () => string | null;
    userIdGetter?: () => string | null;
    userSetter?: (user: UserInfo) => void;
    userIdSetter?: (userId: string) => void;
    clearCache?: () => void;
}
/**
 * 验证并获取缓存的用户信息
 * 如果 token 中的 userId 与缓存不匹配，会清理缓存
 * @param config 缓存配置（可选）
 * @returns 验证后的用户信息或 null
 */
declare function validateAndGetCachedUser(config?: UserCacheConfig): UserInfo | null;
/**
 * 清理用户相关的缓存
 */
declare function clearUserCache(config?: UserCacheConfig): void;
/**
 * 保存用户信息到缓存
 * @param userInfo 用户信息
 * @param config 缓存配置（可选）
 */
declare function saveUserCache(userInfo: UserInfo, config?: UserCacheConfig): void;
/**
 * 检查是否有有效的 token
 * @param tokenGetter 获取 token 的函数（可选）
 * @returns 是否存在 token
 */
declare function checkHasToken(tokenGetter?: () => string | null): boolean;

/**
 * Passport Service - 用户认证、注册、登录
 */

declare class PassportService {
    private client;
    private defaultAppId?;
    constructor(client: RequestClient, defaultAppId?: string | undefined);
    /**
     * 注册
     */
    register(request: RegisterRequest, appId?: string): Promise<ApiResponse<UserResponse>>;
    /**
     * 登录
     */
    login(request: LoginRequest, appId?: string): Promise<ApiResponse<TokenResponse>>;
    /**
     * 登出
     */
    logout(request: LogoutRequest): Promise<ApiResponse<void>>;
    /**
     * 发送验证码
     */
    sendCaptcha(request: CaptchaRequest, appId?: string): Promise<ApiResponse<void>>;
    /**
     * 验证验证码
     */
    verifyCaptcha(request: CaptchaRequest): Promise<ApiResponse<void>>;
    /**
     * 重置密码
     */
    resetPassword(request: ResetPasswordRequest): Promise<ApiResponse<void>>;
    /**
     * 验证 Token
     */
    validateToken(token: string): Promise<ApiResponse<UserResponse>>;
    /**
     * 创建访客账号
     */
    createGuest(request: CreateGuestRequest, appId?: string): Promise<ApiResponse<GuestResponse>>;
    /**
     * 获取用户详情
     */
    getUser(userId: string): Promise<ApiResponse<UserInfo>>;
    /**
     * 批量获取用户
     */
    batchGetUsers(request: BatchGetUserRequest): Promise<ApiResponse<BatchUserResponse>>;
    /**
     * 获取用户列表
     */
    listUsers(params: ListUsersRequest, appId?: string): Promise<ApiResponse<ListUsersReply>>;
    /**
     * 获取用户统计
     */
    getUserStats(appId?: string): Promise<ApiResponse<UserStatsReply>>;
    /**
     * 更新用户资料
     */
    updateProfile(request: UpdateProfileRequest): Promise<ApiResponse<UserInfo>>;
    /**
     * 更新用户状态
     */
    updateUserStatus(request: UpdateUserStatusRequest): Promise<ApiResponse<UserInfo>>;
    /**
     * 加入黑名单
     */
    addToBlacklist(request: AddToBlacklistRequest, appId?: string): Promise<ApiResponse<UserInfo>>;
    /**
     * 移出黑名单
     */
    removeFromBlacklist(userId: string, appId?: string): Promise<ApiResponse<UserInfo>>;
    /**
     * 批量加入黑名单
     */
    batchAddToBlacklist(request: BatchAddToBlacklistRequest, appId?: string): Promise<ApiResponse<BatchAddToBlacklistReply>>;
    /**
     * 根据 IP 获取地理位置
     */
    getLocationByIP(request: GetLocationByIPRequest): Promise<ApiResponse<LocationResponse>>;
}

/**
 * Asset Service - 文件上传、存储、管理
 */

declare class AssetService {
    private client;
    constructor(client: RequestClient);
    /**
     * 上传文件
     */
    uploadFile(file: File, metadata?: Record<string, string>, appId?: string): Promise<ApiResponse<UploadFileResponse>>;
    /**
     * 下载文件
     */
    downloadFile(fileId: string): Promise<ApiResponse<Blob>>;
    /**
     * 获取文件信息
     */
    getFileInfo(fileId: string): Promise<ApiResponse<GetFileInfoReply>>;
    /**
     * 获取文件 URL
     */
    getFileURL(fileId: string, expireSeconds?: number): Promise<ApiResponse<GetFileURLReply>>;
    /**
     * 删除文件
     */
    deleteFile(fileId: string): Promise<ApiResponse<DeleteFileReply>>;
    /**
     * 列出文件
     */
    listFiles(params?: {
        page?: number;
        pageSize?: number;
        type?: string;
    }, appId?: string): Promise<ApiResponse<ListFilesReply>>;
}

/**
 * Notification Service - 通知发送
 */

declare class NotificationService {
    private client;
    constructor(client: RequestClient);
    /**
     * 发送通知
     */
    send(request: SendNotificationRequest): Promise<ApiResponse<SendNotificationReply>>;
    /**
     * 批量发送通知
     */
    batchSend(request: BatchSendRequest): Promise<ApiResponse<BatchSendReply>>;
    /**
     * 获取通知状态
     */
    getStatus(notificationId: string): Promise<ApiResponse<GetStatusReply>>;
    /**
     * 获取通知历史
     */
    getHistory(userId: string, params?: {
        channels?: string[];
        startTime?: number;
        endTime?: number;
        page?: number;
        pageSize?: number;
    }): Promise<ApiResponse<GetHistoryReply>>;
    /**
     * 保存模板（创建或更新）
     */
    saveTemplate(request: SaveTemplateRequest): Promise<ApiResponse<SaveTemplateReply>>;
    /**
     * 列出模板
     */
    listTemplates(request?: ListTemplatesRequest): Promise<ApiResponse<ListTemplatesReply>>;
    /**
     * 设置用户偏好
     */
    setUserPreference(request: SetUserPreferenceRequest): Promise<ApiResponse<SetUserPreferenceReply>>;
    /**
     * 获取用户偏好
     */
    getUserPreference(userId: string): Promise<ApiResponse<GetUserPreferenceReply>>;
}

/**
 * Subscription Service - 订阅管理
 */

declare class SubscriptionService {
    private client;
    constructor(client: RequestClient);
    /**
     * 获取套餐列表
     */
    listPlans(appId?: string): Promise<ApiResponse<ListPlansReply>>;
    /**
     * 创建套餐
     */
    createPlan(request: CreatePlanRequest, appId?: string): Promise<ApiResponse<CreatePlanReply>>;
    /**
     * 更新套餐
     */
    updatePlan(request: UpdatePlanRequest): Promise<ApiResponse<UpdatePlanReply>>;
    /**
     * 删除套餐
     */
    deletePlan(planId: string): Promise<ApiResponse<DeletePlanReply>>;
    /**
     * 获取套餐区域定价列表
     */
    listPlanPricings(planId: string): Promise<ApiResponse<ListPlanPricingsReply>>;
    /**
     * 创建区域定价
     */
    createPlanPricing(request: CreatePlanPricingRequest): Promise<ApiResponse<CreatePlanPricingReply>>;
    /**
     * 更新区域定价
     */
    updatePlanPricing(request: UpdatePlanPricingRequest): Promise<ApiResponse<UpdatePlanPricingReply>>;
    /**
     * 删除区域定价
     */
    deletePlanPricing(planPricingId: number): Promise<ApiResponse<DeletePlanPricingReply>>;
    /**
     * 创建订阅订单
     */
    createSubscriptionOrder(request: CreateSubscriptionOrderRequest): Promise<ApiResponse<CreateSubscriptionOrderReply>>;
    /**
     * 获取我的订阅
     */
    getMySubscription(request: GetMySubscriptionRequest): Promise<ApiResponse<GetMySubscriptionReply>>;
    /**
     * 取消订阅
     */
    cancelSubscription(request: CancelSubscriptionRequest): Promise<ApiResponse<void>>;
    /**
     * 暂停订阅
     */
    pauseSubscription(request: PauseSubscriptionRequest): Promise<ApiResponse<void>>;
    /**
     * 恢复订阅
     */
    resumeSubscription(request: ResumeSubscriptionRequest): Promise<ApiResponse<void>>;
    /**
     * 获取订阅历史
     */
    getSubscriptionHistory(request: GetSubscriptionHistoryRequest): Promise<ApiResponse<GetSubscriptionHistoryReply>>;
    /**
     * 设置自动续费
     */
    setAutoRenew(request: SetAutoRenewRequest): Promise<ApiResponse<void>>;
    /**
     * 获取订阅订单列表（管理员视角）
     */
    listSubscriptionOrders(request: ListSubscriptionOrdersRequest): Promise<ApiResponse<ListSubscriptionOrdersReply>>;
    /**
     * 获取订阅订单详情
     */
    getSubscriptionOrder(request: GetSubscriptionOrderRequest): Promise<ApiResponse<GetSubscriptionOrderReply>>;
    /**
     * 获取应用的订阅用户列表（管理员视角）
     */
    listAppSubscriptions(request: ListAppSubscriptionsRequest): Promise<ApiResponse<ListAppSubscriptionsReply>>;
    /**
     * 获取应用的订阅历史记录（管理员视角）
     */
    getAppSubscriptionHistory(request: GetAppSubscriptionHistoryRequest): Promise<ApiResponse<GetAppSubscriptionHistoryReply>>;
}

/**
 * Payment Service - 支付服务
 */

declare class PaymentService {
    private client;
    private defaultAppId?;
    constructor(client: RequestClient, defaultAppId?: string | undefined);
    /**
     * 创建支付
     */
    createPayment(request: CreatePaymentRequest): Promise<ApiResponse<CreatePaymentReply>>;
    /**
     * 获取支付信息
     */
    getPayment(request: GetPaymentRequest): Promise<ApiResponse<GetPaymentReply>>;
    /**
     * 退款
     */
    refundPayment(request: RefundPaymentRequest): Promise<ApiResponse<RefundPaymentReply>>;
    /**
     * 获取收入统计
     */
    getRevenueStats(appId?: string): Promise<ApiResponse<RevenueStats>>;
    /**
     * 获取应用收入统计
     */
    getAppRevenueStats(appId?: string): Promise<ApiResponse<AppRevenueStats>>;
    /**
     * 获取交易记录列表
     */
    listTransactions(params: ListTransactionsRequest, appId?: string): Promise<ApiResponse<ListTransactionsReply>>;
}

/**
 * Marketing Service - 营销服务
 */

declare class MarketingService {
    private client;
    constructor(client: RequestClient);
    /**
     * 创建优惠券
     */
    createCoupon(request: CreateCouponRequest, appId?: string): Promise<ApiResponse<CreateCouponReply>>;
    /**
     * 获取优惠券
     */
    getCoupon(request: GetCouponRequest): Promise<ApiResponse<GetCouponReply>>;
    /**
     * 列出优惠券
     */
    listCoupons(params: ListCouponsRequest, appId?: string): Promise<ApiResponse<ListCouponsReply>>;
    /**
     * 更新优惠券
     */
    updateCoupon(request: UpdateCouponRequest): Promise<ApiResponse<UpdateCouponReply>>;
    /**
     * 删除优惠券
     */
    deleteCoupon(request: DeleteCouponRequest): Promise<ApiResponse<void>>;
    /**
     * 验证优惠券
     */
    validateCoupon(request: ValidateCouponRequest): Promise<ApiResponse<ValidateCouponReply>>;
    /**
     * 使用优惠券
     */
    useCoupon(request: UseCouponRequest): Promise<ApiResponse<UseCouponReply>>;
    /**
     * 获取优惠券统计
     */
    getCouponStats(request: GetCouponStatsRequest): Promise<ApiResponse<GetCouponStatsReply>>;
    /**
     * 获取优惠券使用记录
     */
    listCouponUsages(request: ListCouponUsagesRequest): Promise<ApiResponse<ListCouponUsagesReply>>;
    /**
     * 获取所有优惠券汇总统计
     */
    getCouponsSummaryStats(request: GetCouponsSummaryStatsRequest): Promise<ApiResponse<GetCouponsSummaryStatsReply>>;
}

/**
 * App Service - 应用管理
 */

declare class AppService {
    private client;
    constructor(client: RequestClient);
    /**
     * 创建应用
     */
    createApp(request: CreateAppRequest): Promise<ApiResponse<CreateAppReply>>;
    /**
     * 获取应用列表
     */
    listApps(request: ListAppsRequest): Promise<ApiResponse<ListAppsReply>>;
    /**
     * 获取应用详情
     */
    getApp(appId: string): Promise<ApiResponse<GetAppReply>>;
    /**
     * 更新应用
     */
    updateApp(request: UpdateAppRequest): Promise<ApiResponse<UpdateAppReply>>;
    /**
     * 删除应用
     */
    deleteApp(appId: string): Promise<ApiResponse<DeleteAppReply>>;
}

/**
 * Short Link Service - 短链接服务
 */

interface CreateShortLinkRequest {
    userId: string;
    originalUrl: string;
    utmLinkId?: string;
    customSuffix?: string;
    expiresAt?: string;
    groupId?: string;
    tags?: string[];
    password?: string;
}
interface ShortLink {
    id: string;
    shortCode: string;
    shortUrl: string;
    originalUrl: string;
    utmLinkId?: string;
    clickCount: number;
    isActive: boolean;
    createdAt: string;
    groupId?: string;
    tags?: string[];
    hasPassword?: boolean;
}
interface CreateShortLinkReply {
    id: string;
    shortCode: string;
    shortUrl: string;
    originalUrl: string;
    createdAt: string;
}
interface ListShortLinksRequest {
    userId: string;
    page: number;
    pageSize: number;
    groupId?: string;
    tags?: string[];
    search?: string;
}
interface ListShortLinksReply {
    links: ShortLink[];
    total: number;
}
interface BatchCreateItem {
    originalUrl: string;
    utmLinkId?: string;
    customSuffix?: string;
    expiresAt?: string;
}
interface BatchCreateShortLinksRequest {
    userId: string;
    items: BatchCreateItem[];
}
interface BatchCreateError {
    index: number;
    originalUrl: string;
    errorMessage: string;
}
interface BatchCreateShortLinksReply {
    links: CreateShortLinkReply[];
    successCount: number;
    totalCount: number;
    errors: BatchCreateError[];
}
interface UpdateShortLinkRequest {
    shortCode: string;
    groupId?: string;
    tags?: string[];
    password?: string;
    isActive?: boolean;
    expiresAt?: string;
}
interface UpdateShortLinkReply {
    shortCode: string;
    success: boolean;
}
interface GetShortLinkStatsRequest {
    shortCode: string;
    startDate: string;
    endDate: string;
}
interface StatItem {
    key: string;
    value: number;
}
interface GetShortLinkStatsReply {
    shortCode: string;
    totalClicks: number;
    deviceStats: StatItem[];
    browserStats: StatItem[];
    osStats: StatItem[];
    provinceStats: StatItem[];
    refererStats: StatItem[];
    hourlyStats: StatItem[];
}
interface GetRealTimeStatsRequest {
    shortCode: string;
    minutes?: number;
}
interface GetRealTimeStatsReply {
    shortCode: string;
    clicksLastMinute: number;
    clicksLast5Minutes: number;
    clicksLast15Minutes: number;
    clicksLastHour: number;
    recentClicks: StatItem[];
}
interface GetTrendStatsRequest {
    shortCode: string;
    startDate: string;
    endDate: string;
    period: 'hour' | 'day' | 'week' | 'month';
}
interface TrendDataPoint {
    time: string;
    clicks: number;
}
interface GetTrendStatsReply {
    shortCode: string;
    period: string;
    dataPoints: TrendDataPoint[];
}
interface GetSourceAnalysisRequest {
    shortCode: string;
    startDate: string;
    endDate: string;
}
interface SourceAnalysis {
    sourceType: string;
    sourceName: string;
    clicks: number;
    percentage: number;
}
interface GetSourceAnalysisReply {
    shortCode: string;
    sources: SourceAnalysis[];
    totalClicks: number;
}
interface GetUserProfileRequest {
    shortCode: string;
    startDate: string;
    endDate: string;
}
interface UserProfile {
    deviceDistribution: StatItem[];
    browserDistribution: StatItem[];
    osDistribution: StatItem[];
    regionDistribution: StatItem[];
}
interface GetUserProfileReply {
    shortCode: string;
    profile: UserProfile;
}
interface GetFunnelAnalysisRequest {
    shortCode: string;
    startDate: string;
    endDate: string;
}
interface FunnelStep {
    stepName: string;
    count: number;
    conversionRate: number;
}
interface GetFunnelAnalysisReply {
    shortCode: string;
    steps: FunnelStep[];
}
interface CreateGroupRequest {
    userId: string;
    name: string;
    description?: string;
}
interface Group {
    id: string;
    name: string;
    description?: string;
    linkCount: number;
    createdAt: string;
}
interface CreateGroupReply {
    id: string;
    name: string;
    createdAt: string;
}
interface ListGroupsRequest {
    userId: string;
}
interface ListGroupsReply {
    groups: Group[];
}
interface SearchTagsRequest {
    userId: string;
    query?: string;
    limit?: number;
}
interface SearchTagsReply {
    tags: string[];
    total: number;
}
interface GenerateQRCodeRequest {
    shortCode: string;
    size?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}
interface GenerateQRCodeReply {
    qrcodeBase64: string;
    qrcodeUrl?: string;
    size: number;
}
declare class ShortLinkService {
    private client;
    constructor(client: RequestClient);
    /**
     * 创建短链接
     */
    createShortLink(request: CreateShortLinkRequest): Promise<ApiResponse<CreateShortLinkReply>>;
    /**
     * 获取短链接信息
     */
    getShortLink(shortCode: string): Promise<ApiResponse<ShortLink>>;
    /**
     * 获取短链接列表
     */
    listShortLinks(request: ListShortLinksRequest): Promise<ApiResponse<ListShortLinksReply>>;
    /**
     * 批量创建短链接
     */
    batchCreateShortLinks(request: BatchCreateShortLinksRequest): Promise<ApiResponse<BatchCreateShortLinksReply>>;
    /**
     * 更新短链接
     */
    updateShortLink(request: UpdateShortLinkRequest): Promise<ApiResponse<UpdateShortLinkReply>>;
    /**
     * 获取短链接统计
     */
    getShortLinkStats(request: GetShortLinkStatsRequest): Promise<ApiResponse<GetShortLinkStatsReply>>;
    /**
     * 获取实时统计
     */
    getRealTimeStats(request: GetRealTimeStatsRequest): Promise<ApiResponse<GetRealTimeStatsReply>>;
    /**
     * 获取趋势统计
     */
    getTrendStats(request: GetTrendStatsRequest): Promise<ApiResponse<GetTrendStatsReply>>;
    /**
     * 获取来源分析
     */
    getSourceAnalysis(request: GetSourceAnalysisRequest): Promise<ApiResponse<GetSourceAnalysisReply>>;
    /**
     * 获取用户画像
     */
    getUserProfile(request: GetUserProfileRequest): Promise<ApiResponse<GetUserProfileReply>>;
    /**
     * 获取漏斗分析
     */
    getFunnelAnalysis(request: GetFunnelAnalysisRequest): Promise<ApiResponse<GetFunnelAnalysisReply>>;
    /**
     * 创建分组
     */
    createGroup(request: CreateGroupRequest): Promise<ApiResponse<CreateGroupReply>>;
    /**
     * 获取分组列表
     */
    listGroups(request: ListGroupsRequest): Promise<ApiResponse<ListGroupsReply>>;
    /**
     * 搜索标签
     */
    searchTags(request: SearchTagsRequest): Promise<ApiResponse<SearchTagsReply>>;
    /**
     * 生成二维码
     */
    generateQRCode(request: GenerateQRCodeRequest): Promise<ApiResponse<GenerateQRCodeReply>>;
}

/**
 * AtSeeker SDK - 统一的公共服务 SDK
 *
 * 当前包含的服务（核心 SDK）：
 * - passport: 用户认证、注册、登录
 * - asset: 文件上传、存储、管理
 * - notification: 通知发送（短信、邮件、推送）
 * - subscription: 订阅管理
 * - payment: 支付服务
 * - marketing: 营销服务（优惠券等）
 * - shortLink: 短链接服务 ✅ 新增
 *
 * 按需添加的服务（后续根据开发者反馈添加）：
 * - billing: 计费查询（余额、账单、统计）
 * - apiKey: API Key 管理（主要用于自动化场景）
 */

/**
 * AtSeeker SDK 主类
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
declare class AtSeekerSDK {
    private config;
    private client;
    readonly passport: PassportService;
    readonly asset: AssetService;
    readonly notification: NotificationService;
    readonly subscription: SubscriptionService;
    readonly payment: PaymentService;
    readonly marketing: MarketingService;
    readonly app: AppService;
    readonly shortLink: ShortLinkService;
    constructor(config: SDKConfig);
    /**
     * 获取配置
     */
    getConfig(): SDKConfig;
    /**
     * 更新配置
     */
    updateConfig(config: Partial<SDKConfig>): void;
}

export { AppService, AssetService, AtSeekerSDK, AuthManager, MarketingService, NotificationService, PassportService, PaymentService, RequestClient, ShortLinkService, SubscriptionService, checkHasToken, clearUserCache, AtSeekerSDK as default, getUserIdFromToken, parseError, parseUserIdFromToken, saveUserCache, validateAndGetCachedUser };
export type { AddToBlacklistRequest, ApiError, ApiResponse, AppInfo, AppRevenueStats, AppSubscriptionInfo, BatchAddToBlacklistReply, BatchAddToBlacklistRequest, BatchCreateError, BatchCreateItem, BatchCreateShortLinksReply, BatchCreateShortLinksRequest, BatchGetUserRequest, BatchSendReply, BatchSendRequest, BatchSendResult, BatchUserResponse, CancelSubscriptionRequest, CaptchaRequest, ChannelPreference, ChannelResult, Coupon, CouponStats, CouponUsage, CouponsSummaryStats, CreateAppReply, CreateAppRequest, CreateCouponReply, CreateCouponRequest, CreateGroupReply, CreateGroupRequest, CreateGuestRequest, CreatePaymentReply, CreatePaymentRequest, CreatePlanPricingReply, CreatePlanPricingRequest, CreatePlanReply, CreatePlanRequest, CreateShortLinkReply, CreateShortLinkRequest, CreateSubscriptionOrderReply, CreateSubscriptionOrderRequest, DeleteAppReply, DeleteCouponRequest, DeleteFileReply, DeletePlanPricingReply, DeletePlanPricingRequest, DeletePlanReply, FileInfo, FunnelStep, GenerateQRCodeReply, GenerateQRCodeRequest, GetAppReply, GetAppSubscriptionHistoryReply, GetAppSubscriptionHistoryRequest, GetCouponReply, GetCouponRequest, GetCouponStatsReply, GetCouponStatsRequest, GetCouponsSummaryStatsReply, GetCouponsSummaryStatsRequest, GetFileInfoReply, GetFileURLReply, GetFunnelAnalysisReply, GetFunnelAnalysisRequest, GetHistoryReply, GetLocationByIPRequest, GetMySubscriptionReply, GetMySubscriptionRequest, GetPaymentReply, GetPaymentRequest, GetRealTimeStatsReply, GetRealTimeStatsRequest, GetShortLinkStatsReply, GetShortLinkStatsRequest, GetSourceAnalysisReply, GetSourceAnalysisRequest, GetStatusReply, GetSubscriptionHistoryReply, GetSubscriptionHistoryRequest, GetSubscriptionOrderReply, GetSubscriptionOrderRequest, GetTrendStatsReply, GetTrendStatsRequest, GetUserPreferenceReply, GetUserProfileReply, GetUserProfileRequest, Group, GuestResponse, ListAppSubscriptionsReply, ListAppSubscriptionsRequest, ListAppsReply, ListAppsRequest, ListCouponUsagesReply, ListCouponUsagesRequest, ListCouponsReply, ListCouponsRequest, ListFilesReply, ListGroupsReply, ListGroupsRequest, ListPlanPricingsReply, ListPlansReply, ListShortLinksReply, ListShortLinksRequest, ListSubscriptionOrdersReply, ListSubscriptionOrdersRequest, ListTemplatesReply, ListTemplatesRequest, ListTransactionsReply, ListTransactionsRequest, ListUsersReply, ListUsersRequest, LocationResponse, LoginRequest, LogoutRequest, NotificationRecord, PauseSubscriptionRequest, PaymentMethod, PaymentStatus, Plan, PlanPricing, RefundPaymentReply, RefundPaymentRequest, RegisterRequest, RemoveFromBlacklistRequest, ResetPasswordRequest, ResumeSubscriptionRequest, RevenueStats, SDKConfig, SaveTemplateReply, SaveTemplateRequest, SearchTagsReply, SearchTagsRequest, SendNotificationReply, SendNotificationRequest, SetAutoRenewRequest, SetUserPreferenceReply, SetUserPreferenceRequest, ShortLink, SourceAnalysis, StatItem, SubscriptionHistoryItem, SubscriptionOrderInfo, Template, TokenResponse, TransactionRecord, TrendDataPoint, UpdateAppReply, UpdateAppRequest, UpdateCouponReply, UpdateCouponRequest, UpdatePlanPricingReply, UpdatePlanPricingRequest, UpdatePlanReply, UpdatePlanRequest, UpdateProfileRequest, UpdateShortLinkReply, UpdateShortLinkRequest, UpdateUserStatusRequest, UploadFileResponse, UseCouponReply, UseCouponRequest, UserClaims, UserInfo, UserProfile, UserResponse, UserStatsReply, ValidateCouponReply, ValidateCouponRequest, ValidateTokenRequest };
