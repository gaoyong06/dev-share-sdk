# Analytics SDK for JavaScript

极简易用的数据分析 JavaScript SDK，专为独立开发者设计。

## 特性

- 🚀 **极简集成** - 一行代码即可集成
- 📊 **自动追踪** - 自动追踪页面浏览和点击事件
- 🔗 **UTM 支持** - 自动捕获和保存 UTM 参数
- 📦 **批量发送** - 智能批量发送，减少网络请求
- 🎯 **会话管理** - 自动管理用户会话
- 🔒 **隐私友好** - 支持匿名用户追踪
- 📱 **TypeScript** - 完整的 TypeScript 类型定义

## 安装

### NPM

```bash
npm install @dev-share/analytics-sdk
```

### Yarn

```bash
yarn add @dev-share/analytics-sdk
```

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@dev-share/analytics-sdk/dist/index.js"></script>
```

## 快速开始

### 基础用法

```javascript
import Analytics from '@dev-share/analytics-sdk'

// 初始化 SDK
const analytics = new Analytics({
  apiUrl: 'https://api.yourapp.com',
  appId: 'your-app-id',
  autoTrackPageView: true, // 自动追踪页面浏览
  debug: true, // 开发环境启用调试
})

// 追踪自定义事件
analytics.track({
  eventName: 'button_click',
  properties: {
    button_name: 'signup',
    page: 'homepage',
  },
})
```

### 在 HTML 中使用

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <script src="https://cdn.jsdelivr.net/npm/@dev-share/analytics-sdk/dist/index.js"></script>
  <script>
    // 初始化 SDK
    const analytics = new Analytics.Analytics({
      apiUrl: 'https://api.yourapp.com',
      appId: 'your-app-id',
      autoTrackPageView: true,
    })

    // 追踪事件
    document.getElementById('signup-button').addEventListener('click', () => {
      analytics.track({
        eventName: 'signup_click',
        properties: {
          source: 'homepage',
        },
      })
    })
  </script>
</body>
</html>
```

## API 文档

### 初始化

```typescript
const analytics = new Analytics({
  apiUrl: string,              // API 端点 URL（必需）
  appId: string,               // 应用 ID（必需）
  userId?: string,             // 用户 ID（可选）
  autoTrackPageView?: boolean, // 是否自动追踪页面浏览（默认：true）
  autoTrackClick?: boolean,    // 是否自动追踪点击事件（默认：false）
  batchInterval?: number,      // 批量发送间隔，毫秒（默认：5000）
  batchSize?: number,          // 批量发送大小（默认：10）
  sessionTimeout?: number,     // 会话超时时间，毫秒（默认：1800000，30分钟）
  debug?: boolean,             // 调试模式（默认：false）
})
```

### 追踪事件

```typescript
// 追踪自定义事件
analytics.track({
  eventName: string,           // 事件名称（必需）
  properties?: object,         // 自定义属性（可选）
  userId?: string,             // 用户 ID（可选，覆盖全局配置）
  sessionId?: string,          // 会话 ID（可选，通常自动生成）
  anonymousId?: string,        // 匿名 ID（可选，通常自动生成）
  pageUrl?: string,           // 页面 URL（可选，自动获取）
  pageTitle?: string,          // 页面标题（可选，自动获取）
  referrer?: string,          // 来源 URL（可选，自动获取）
  timestamp?: Date,           // 时间戳（可选，自动生成）
})
```

### 追踪页面浏览

```typescript
// 手动追踪页面浏览
analytics.trackPageView({
  page_name: 'product-page',
  category: 'electronics',
})
```

### 追踪点击事件

```typescript
// 手动追踪点击事件
const button = document.getElementById('signup-button')
analytics.trackClick(button, {
  button_name: 'signup',
  position: 'header',
})
```

### 用户识别

```typescript
// 设置用户 ID（用户登录后调用）
analytics.identify('user-123')

// 重置用户（用户登出时调用）
analytics.reset()
```

### 手动刷新队列

```typescript
// 立即发送所有待发送的事件
await analytics.flush()
```

### 销毁实例

```typescript
// 清理资源（页面卸载前调用）
analytics.destroy()
```

## 事件属性

所有事件自动包含以下属性：

- `userAgent` - 用户代理
- `language` - 浏览器语言
- `screenResolution` - 屏幕分辨率
- `pageUrl` - 页面 URL
- `pageTitle` - 页面标题
- `referrer` - 来源 URL
- `utm_source` - UTM 来源（如果存在）
- `utm_medium` - UTM 媒介（如果存在）
- `utm_campaign` - UTM 活动（如果存在）
- `utm_term` - UTM 关键词（如果存在）
- `utm_content` - UTM 内容（如果存在）

## UTM 参数处理

SDK 会自动：

1. 从 URL 中提取 UTM 参数
2. 将 UTM 参数保存到 localStorage
3. 在后续事件中自动包含 UTM 参数（即使 URL 中不再包含）

这样可以确保用户在访问多个页面后，UTM 参数仍然被保留。

## 会话管理

SDK 自动管理用户会话：

- 自动生成会话 ID
- 自动检测会话过期（默认 30 分钟无活动）
- 会话过期后自动创建新会话
- 会话 ID 保存在 localStorage 中

## 批量发送

SDK 使用智能批量发送机制：

- 事件先加入队列
- 达到批量大小（默认 10 个）时立即发送
- 或达到批量间隔（默认 5 秒）时发送
- 页面卸载前自动发送所有待发送事件

## 调试模式

启用调试模式后，SDK 会在控制台输出详细的日志：

```javascript
const analytics = new Analytics({
  // ... 其他配置
  debug: true,
})
```

## 示例

### React 应用

```jsx
import { useEffect } from 'react'
import Analytics from '@dev-share/analytics-sdk'

function App() {
  useEffect(() => {
    const analytics = new Analytics({
      apiUrl: 'https://api.yourapp.com',
      appId: 'your-app-id',
      autoTrackPageView: true,
    })

    // 用户登录后
    analytics.identify('user-123')

    return () => {
      analytics.destroy()
    }
  }, [])

  const handleSignup = () => {
    analytics.track({
      eventName: 'signup',
      properties: {
        source: 'homepage',
      },
    })
  }

  return <button onClick={handleSignup}>Sign Up</button>
}
```

### Vue 应用

```vue
<template>
  <button @click="handleClick">Sign Up</button>
</template>

<script>
import Analytics from '@dev-share/analytics-sdk'

export default {
  mounted() {
    this.analytics = new Analytics({
      apiUrl: 'https://api.yourapp.com',
      appId: 'your-app-id',
      autoTrackPageView: true,
    })
  },
  beforeUnmount() {
    this.analytics.destroy()
  },
  methods: {
    handleClick() {
      this.analytics.track({
        eventName: 'signup_click',
        properties: {
          source: 'homepage',
        },
      })
    },
  },
}
</script>
```

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)
- 移动端浏览器

## License

MIT

