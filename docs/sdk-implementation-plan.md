# SDK 实施计划

## 📋 当前实施策略

**方案**：核心 SDK + 可选模块（按需添加）

**原则**：
- 聚焦核心业务功能
- 保持 SDK 轻量和易用
- 根据开发者反馈按需添加管理功能

---

## 🎯 阶段 1：核心 SDK（当前实施）

### ✅ 包含的服务（7个）

| 服务 | 用途 | 状态 |
|------|------|------|
| **passport-service** | 用户认证、注册、登录 | ✅ 已包含 |
| **asset-service** | 文件上传、存储、管理 | ✅ 已包含 |
| **notification-service** | 通知发送（短信、邮件、推送） | ✅ 已包含 |
| **subscription-service** | 订阅管理 | ✅ 已包含 |
| **payment-service** | 支付服务 | ✅ 已包含 |
| **marketing-service** | 营销服务（优惠券等） | ✅ 已包含 |
| **short-link-service** | 短链接生成、跳转、统计 | ✅ **待新增** |

### ❌ 不包含的服务（2个，后续按需添加）

| 服务 | 用途 | 不包含原因 | 后续策略 |
|------|------|----------|---------|
| **billing-service** | 计费服务（查询功能） | 主要使用场景是 Web UI（查看报表） | 根据开发者反馈按需添加 |
| **api-key-service** | API Key 管理 | 主要使用场景是 Web UI（管理后台） | 根据开发者反馈按需添加（作为可选模块） |

---

## 📦 SDK 结构设计

### 当前结构（阶段 1）

```
@atseeker/sdk (核心 SDK)
├── passport      # 认证服务
├── asset         # 文件服务
├── notification  # 通知服务
├── subscription  # 订阅服务
├── payment       # 支付服务
├── marketing     # 营销服务
└── shortLink     # 短链接服务 ✅ 新增
```

### 未来结构（阶段 2，按需添加）

```
@atseeker/sdk (核心 SDK)
├── passport      # 认证服务
├── asset         # 文件服务
├── notification  # 通知服务
├── subscription  # 订阅服务
├── payment       # 支付服务
├── marketing     # 营销服务
├── shortLink     # 短链接服务
└── admin         # 可选管理模块 ⏳ 按需添加
    ├── billing   # 计费查询（GetAccount, ListRecords, GetStats*, Recharge）
    └── apiKey    # API Key 管理（CreateKey, GetKey, DeleteKey, App 管理等）
```

---

## 🚀 实施步骤

### 步骤 1：移除 billing-service 和 api-key-service（如果已包含）✅

**检查当前 SDK**：
- ✅ 已检查 `dev-share-sdk/packages/core/src/services` 目录（源代码目录之前是空的）
- ✅ 从主 SDK 类 (`src/index.ts`) 中移除了 `billing` 和 `apiKey` 服务

**操作**：
1. ✅ 检查了 `dev-share-sdk/packages/core/src/services` 目录
2. ✅ 从 `src/index.ts` 中移除了 `billing` 和 `apiKey` 的初始化和导出
3. ✅ 更新了 SDK 类的构造函数，不再初始化这两个服务
4. ✅ 更新了文档说明（见 `SDK_UPDATE_STATUS.md`）

### 步骤 2：添加 short-link-service ✅

**操作**：
1. ✅ 创建了 `dev-share-sdk/packages/core/src/services/short-link.ts`
2. ✅ 实现了 ShortLinkService 类，包含完整的短链接功能
3. ✅ 在 `AtSeekerSDK` 类中添加了 `shortLink` 属性
4. ⏳ 类型定义需要从其他服务的源代码文件中导出（待创建其他服务的源代码文件）

### 步骤 3：更新文档

**操作**：
1. 更新 `dev-share-sdk/README.md`，说明当前包含的服务
2. 添加"按需添加"章节，说明 billing 和 api-key 的添加计划
3. 更新使用示例

---

## 📝 文档更新

### README.md 更新建议

```markdown
## 当前包含的服务

- ✅ passport - 用户认证、注册、登录
- ✅ asset - 文件上传、存储、管理
- ✅ notification - 通知发送
- ✅ subscription - 订阅管理
- ✅ payment - 支付服务
- ✅ marketing - 营销服务
- ✅ shortLink - 短链接服务

## 按需添加的服务

以下服务将根据开发者反馈按需添加：

- ⏳ billing - 计费查询（余额、账单、统计）
- ⏳ apiKey - API Key 管理（主要用于自动化场景）

如果您需要这些功能，请通过以下方式反馈：
- GitHub Issues
- 邮件反馈
- 社区讨论
```

---

## 🔄 后续计划

### 阶段 2：根据反馈添加 billing-service

**触发条件**：
- 开发者反馈需要查询账单、余额、统计
- 开发者需要集成到自己的系统中展示成本

**添加内容**：
- `GetAccount` - 获取账户信息
- `Recharge` - 发起充值
- `ListRecords` - 获取消费流水
- `GetStatsToday` - 获取今日统计
- `GetStatsMonth` - 获取本月统计
- `GetStatsSummary` - 获取汇总统计

**实施方式**：
- 作为核心 SDK 的一部分添加
- 或作为可选模块 `@atseeker/sdk/billing`

### 阶段 3：根据反馈添加 api-key-service

**触发条件**：
- 开发者反馈需要 API Key 管理 API
- 开发者需要自动化场景（CI/CD、脚本）

**添加内容**：
- `CreateKey` - 生成 API Key
- `GetKey` - 获取 API Key
- `DeleteKey` - 删除 API Key
- `CreateApp` - 创建应用
- `ListApps` - 获取应用列表
- `GetApp` - 获取应用详情
- `UpdateApp` - 更新应用
- `DeleteApp` - 删除应用

**实施方式**：
- 作为可选模块 `@atseeker/sdk/admin`
- 或作为核心 SDK 的可选导入

---

## 💡 关键原则

1. **聚焦核心**：当前 SDK 聚焦核心业务功能
2. **保持轻量**：不包含低频使用的管理功能
3. **按需添加**：根据开发者反馈决定是否添加
4. **模块化设计**：如果添加，采用可选模块设计
5. **文档清晰**：明确说明哪些功能已包含，哪些按需添加

---

## 📊 对比分析

| 方案 | 当前 SDK 大小 | 灵活性 | 推荐度 |
|------|-------------|--------|--------|
| **包含所有服务** | ⭐⭐⭐⭐⭐ 大 | ⭐⭐⭐ 低 | ⭐⭐ |
| **核心 SDK + 按需添加** | ⭐⭐⭐ 中 | ⭐⭐⭐⭐⭐ 高 | ⭐⭐⭐⭐⭐ |
| **核心 SDK + 独立管理 SDK** | ⭐⭐⭐ 中 | ⭐⭐⭐⭐ 中 | ⭐⭐⭐⭐ |

**选择**：核心 SDK + 按需添加 ✅

**优势**：
- ✅ SDK 保持轻量
- ✅ 聚焦核心业务功能
- ✅ 根据实际需求添加
- ✅ 避免过度设计
