# Analytics SDK 接入指南

## 🎯 极简接入（推荐）

### Next.js 项目

**步骤 1：安装依赖**

```bash
pnpm add @atseeker/analytics-sdk
# 或
npm install @atseeker/analytics-sdk
```

**步骤 2：创建代理路由（解决 CORS）**

```tsx
// app/api/proxy/route.ts
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  return forward(req)
}

export async function POST(req: Request) {
  return forward(req)
}

async function forward(req: Request) {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path')
  if (!path) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 })
  }

  const baseUrl = path.startsWith('/analytics/v1')
    ? process.env.ANALYTICS_BASE_URL || 'http://localhost:8110'
    : process.env.APISIX_GATEWAY_URL || 'http://localhost:9080'

  const targetUrl = `${baseUrl}${path}`
  const body = req.method === 'GET' ? undefined : await req.text()

  const response = await fetch(targetUrl, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      ...Object.fromEntries(req.headers.entries()),
    },
    body,
  })

  return new Response(await response.text(), {
    status: response.status,
    headers: response.headers,
  })
}
```

**步骤 3：创建 AnalyticsTracker 组件**

```tsx
// components/analytics-tracker.tsx
'use client'

import { useEffect } from 'react'
import { initAnalytics } from '@atseeker/analytics-sdk'

export function AnalyticsTracker() {
  useEffect(() => {
    initAnalytics({
      appId: process.env.NEXT_PUBLIC_ANALYTICS_APP_ID || 'your-app-id',
      useProxy: true,
      apiProxy: '/api/proxy',
      debug: process.env.NODE_ENV !== 'production',
    })
  }, [])

  return null
}
```

**步骤 4：在 layout.tsx 中引入**

```tsx
// app/layout.tsx
import { Suspense } from 'react'
import { AnalyticsTracker } from '@/components/analytics-tracker'

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
      </body>
    </html>
  )
}
```

**完成！** 🎉 现在你的应用会自动追踪所有页面浏览。

### 环境变量配置

在 `.env.local` 中添加：

```bash
# Analytics Service 地址（如果使用代理）
ANALYTICS_BASE_URL=http://localhost:8110

# 你的应用 ID（可选，也可以在代码中传入）
NEXT_PUBLIC_ANALYTICS_APP_ID=your-app-id-here
```

## 📊 自定义事件追踪

```tsx
import { getAnalytics } from '@atseeker/analytics-sdk'

function MyComponent() {
  const handleClick = () => {
    const analytics = getAnalytics()
    if (analytics) {
      analytics.track({
        eventName: 'button_click',
        properties: {
          button_name: 'signup',
          page: 'homepage',
        },
      })
    }
  }

  return <button onClick={handleClick}>Sign Up</button>
}
```

## 🔧 高级配置

### 自定义 userId 获取

```tsx
initAnalytics({
  appId: 'your-app-id',
  getUserId: () => {
    // 从你的状态管理或 token 中获取
    return getUserIdFromToken() || localStorage.getItem('user_id') || ''
  },
})
```

### 从 meta 标签读取 appId

```html
<!-- 在 HTML head 中 -->
<meta name="analytics-app-id" content="your-app-id" />
```

```tsx
// 代码中不需要传 appId，SDK 会自动读取
initAnalytics({
  useProxy: true,
  apiProxy: '/api/proxy',
})
```

### 禁用自动页面追踪

```tsx
initAnalytics({
  appId: 'your-app-id',
  autoTrackPageView: false, // 手动控制
  routeTracking: 'manual',  // 不自动监听路由
})
```

## 🐛 调试

启用调试模式后，SDK 会在浏览器控制台输出详细日志：

```tsx
initAnalytics({
  appId: 'your-app-id',
  debug: true, // 开发环境启用
})
```

## ❓ 常见问题

### Q: 为什么数据都是 0？

A: 检查以下几点：
1. 确保 `appId` 配置正确
2. 确保 `analytics-service` 正在运行
3. 确保代理路由 `/api/proxy` 配置正确
4. 打开浏览器控制台，查看是否有错误日志
5. 启用 `debug: true` 查看详细日志

### Q: Next.js 构建时提示 "initAnalytics is not exported"

A: 这是 webpack 静态分析的警告，不影响运行时。如果构建成功，运行时应该没问题。如果确实有问题，可以尝试：

```tsx
// 使用动态导入
import('@atseeker/analytics-sdk').then(({ initAnalytics }) => {
  initAnalytics({ ... })
})
```

### Q: 如何追踪用户登录/登出？

```tsx
import { getAnalytics } from '@atseeker/analytics-sdk'

// 登录后
const analytics = getAnalytics()
if (analytics) {
  analytics.identify(userId)
}

// 登出后
if (analytics) {
  analytics.reset()
}
```

## 📚 更多示例

查看 [README.md](./README.md) 获取完整的 API 文档。
