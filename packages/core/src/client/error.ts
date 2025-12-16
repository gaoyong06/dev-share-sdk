// 错误处理工具

import type { ApiError } from '../types'

/**
 * 解析 API 响应中的错误信息
 */
export function parseError(data: any, status: number): ApiError {
  // 处理响应格式：{ success: boolean, data: T, errorCode?: string, errorMessage?: string }
  if (data.success === false || (data.errorCode && data.success !== true)) {
    let errorCode = 0
    if (data.errorCode) {
      const parsedCode = parseInt(data.errorCode, 10)
      errorCode = isNaN(parsedCode) ? 0 : parsedCode
    } else if (status >= 400) {
      errorCode = status
    }

    return {
      code: errorCode,
      message: data.errorMessage || data.message || "请求失败",
      details: data,
    }
  }

  // 处理标准格式：{ code: number, message: string, data: T }
  if (data.code !== undefined && data.code !== 0) {
    return {
      code: data.code,
      message: data.message || "请求失败",
      details: data,
    }
  }

  // HTTP 错误
  return {
    code: status,
    message: data.errorMessage || data.message || data.error || "请求失败",
    details: data,
  }
}

