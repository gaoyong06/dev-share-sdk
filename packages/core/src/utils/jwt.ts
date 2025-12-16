/**
 * JWT Token 解析工具
 * 从 JWT token 中提取用户信息
 */

/**
 * 解析 JWT token，提取 userId
 * @param token JWT token 字符串
 * @returns userId（字符串 UUID）或 null
 */
export function parseUserIdFromToken(token: string): string | null {
  try {
    // JWT 格式：header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    // 解析 payload（base64url 解码）
    const payload = parts[1]
    // 添加 padding（如果需要）
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4)
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'))
    const claims = JSON.parse(decodedPayload)

    // 提取 userId（字符串 UUID）
    if (claims.userId && typeof claims.userId === 'string') {
      return claims.userId
    }

    return null
  } catch (error) {
    console.error('Failed to parse JWT token:', error)
    return null
  }
}

/**
 * 从存储中获取 access_token 并解析 userId
 * @param tokenGetter 获取 token 的函数（可选，默认从 localStorage）
 * @returns userId（字符串 UUID）或 null
 */
export function getUserIdFromToken(tokenGetter?: () => string | null): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const getToken = tokenGetter || (() => {
    return typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  })

  const token = getToken()
  if (!token) {
    return null
  }

  return parseUserIdFromToken(token)
}

