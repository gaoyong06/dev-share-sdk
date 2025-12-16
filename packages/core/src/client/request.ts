// HTTP 请求封装

import type { ApiResponse, ApiError } from '../types'
import type { SDKConfig } from '../types/config'
import { AuthManager } from './auth'
import { parseError } from './error'

export class RequestClient {
  private config: SDKConfig
  private authManager: AuthManager

  constructor(config: SDKConfig) {
    this.config = config
    this.authManager = new AuthManager(config)
  }

  /**
   * 通用请求函数
   */
  async request<T>(
    url: string,
    options: RequestInit & {
      params?: Record<string, string | number | boolean | undefined>
      appId?: string
    } = {}
  ): Promise<ApiResponse<T>> {
    try {
      const { params, appId, headers, ...restOptions } = options

      // 构建查询参数
      const searchParams = new URLSearchParams()
      
      // 添加 appId（如果提供）
      if (appId) {
        searchParams.append('appId', appId)
      } else if (this.config.appId) {
        searchParams.append('appId', this.config.appId)
      }
      
      // 添加其他查询参数
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value))
          }
        })
      }

      // 构建完整的 API 路径
      let apiPath = url
      if (searchParams.toString()) {
        apiPath = `${url}?${searchParams.toString()}`
      }

      // 构建目标 URL
      const baseURL = this.config.baseURL || 'http://localhost:9080'
      const useProxy = this.config.useProxy || false
      const apiProxy = this.config.apiProxy || '/api/proxy'
      
      const targetUrl = useProxy
        ? `${apiProxy}?path=${encodeURIComponent(apiPath)}`
        : `${baseURL}${apiPath}`

      // 获取 token 和 API Key
      const token = this.authManager.getToken()
      const apiKey = this.config.apiKey

      // 构建请求头
      const requestHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(apiKey && { 'X-API-Key': apiKey }),
        ...headers,
      }

      // 发起请求
      let response: Response
      try {
        response = await fetch(targetUrl, {
          ...restOptions,
          headers: requestHeaders,
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '网络请求失败'
        const isCorsError = errorMessage.includes('CORS') || 
                          errorMessage.includes('cors') || 
                          errorMessage.includes('Failed to fetch') || 
                          errorMessage.includes('NetworkError')
        
        const apiError: ApiError = {
          code: isCorsError ? -1 : 0,
          message: isCorsError
            ? `CORS 错误: 无法访问 ${targetUrl}。请检查 CORS 配置。`
            : `网络错误: ${errorMessage}`,
          details: { url: targetUrl, originalError: errorMessage },
        }
        return { error: apiError }
      }

      // 检查响应状态
      if (!response.ok && response.status === 0) {
        const apiError: ApiError = {
          code: -1,
          message: `CORS 错误: 无法访问 ${targetUrl}。请检查 CORS 配置。`,
          details: { url: targetUrl, status: response.status },
        }
        return { error: apiError }
      }

      // 解析响应
      let data
      try {
        data = await response.json()
      } catch (error) {
        const apiError: ApiError = {
          code: response.status || 0,
          message: error instanceof Error ? error.message : '响应格式错误',
          details: { url: targetUrl, status: response.status },
        }
        return { error: apiError }
      }

      // 处理错误响应
      const isSuccess = data.success === true || data.success === 'true'
      const hasErrorCode = data.errorCode && data.errorCode !== '' && data.errorCode !== '0'
      
      if (data.success === false || data.success === 'false' || (hasErrorCode && parseInt(data.errorCode) !== 0)) {
        return { error: parseError(data, response.status) }
      }

      // 如果 HTTP 状态码不是 2xx
      if (!response.ok && response.status >= 400) {
        return { error: parseError(data, response.status) }
      }

      // 返回数据
      return { data: data.data !== undefined ? data.data : data }
    } catch (error) {
      const apiError: ApiError = {
        code: 0,
        message: error instanceof Error ? error.message : '网络错误',
      }
      return { error: apiError }
    }
  }

  /**
   * GET 请求
   */
  async get<T>(url: string, options?: {
    params?: Record<string, string | number | boolean | undefined>
    appId?: string
    headers?: HeadersInit
  }): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'GET',
    })
  }

  /**
   * POST 请求
   */
  async post<T>(url: string, body?: unknown, options?: {
    params?: Record<string, string | number | boolean | undefined>
    appId?: string
    headers?: HeadersInit
  }): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * PUT 请求
   */
  async put<T>(url: string, body?: unknown, options?: {
    params?: Record<string, string | number | boolean | undefined>
    appId?: string
    headers?: HeadersInit
  }): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * DELETE 请求
   */
  async delete<T>(url: string, options?: {
    params?: Record<string, string | number | boolean | undefined>
    appId?: string
    headers?: HeadersInit
  }): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'DELETE',
    })
  }

  /**
   * 上传文件（FormData）
   */
  async uploadFile<T>(
    url: string,
    file: File,
    metadata?: Record<string, string>,
    options?: {
      appId?: string
      headers?: HeadersInit
    }
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // 添加元数据
      if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
          formData.append(key, value)
        })
      }

      // 构建目标 URL
      const baseURL = this.config.baseURL || 'http://localhost:9080'
      const useProxy = this.config.useProxy || false
      const apiProxy = this.config.apiProxy || '/api/proxy'
      
      const targetUrl = useProxy
        ? `${apiProxy}?path=${encodeURIComponent(url)}`
        : `${baseURL}${url}`

      // 获取 token 和 API Key
      const token = this.authManager.getToken()
      const apiKey = this.config.apiKey

      // 构建请求头（FormData 不需要设置 Content-Type）
      const requestHeaders: HeadersInit = {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(apiKey && { 'X-API-Key': apiKey }),
        ...options?.headers,
      }

      // 添加 appId 到查询参数
      const searchParams = new URLSearchParams()
      if (options?.appId) {
        searchParams.append('appId', options.appId)
      } else if (this.config.appId) {
        searchParams.append('appId', this.config.appId)
      }
      
      const finalUrl = searchParams.toString()
        ? `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}${searchParams.toString()}`
        : targetUrl

      // 发起请求
      let response: Response
      try {
        response = await fetch(finalUrl, {
          method: 'POST',
          body: formData,
          headers: requestHeaders,
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '网络请求失败'
        return {
          error: {
            code: -1,
            message: `网络错误: ${errorMessage}`,
            details: { url: finalUrl, originalError: errorMessage },
          },
        }
      }

      // 检查响应状态
      if (!response.ok && response.status === 0) {
        return {
          error: {
            code: -1,
            message: `CORS 错误: 无法访问 ${finalUrl}`,
            details: { url: finalUrl, status: response.status },
          },
        }
      }

      // 解析响应
      let data
      try {
        data = await response.json()
      } catch (error) {
        return {
          error: {
            code: response.status || 0,
            message: error instanceof Error ? error.message : '响应格式错误',
            details: { url: finalUrl, status: response.status },
          },
        }
      }

      // 处理错误响应
      if (data.success === false || (data.errorCode && data.success !== true)) {
        return { error: parseError(data, response.status) }
      }

      if (data.code !== undefined && data.code !== 0) {
        return { error: parseError(data, response.status) }
      }

      if (!response.ok && response.status >= 400) {
        return { error: parseError(data, response.status) }
      }

      // 返回数据
      return { data: data.data !== undefined && data.data !== null ? data.data : data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '文件上传失败'
      return {
        error: {
          code: 0,
          message: errorMessage,
        },
      }
    }
  }
}

