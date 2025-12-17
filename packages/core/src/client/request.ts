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

      // 获取 appId（确保是字符串）
      // APISIX 的 app-id 插件会从查询参数 appId 提取并转换为 X-App-Id Header
      console.log('[SDK] uploadFile: START - options:', options, 'config.appId:', this.config.appId, 'type:', typeof this.config.appId)
      
      let appIdString: string | undefined
      
      // 优先使用 options 中的 appId
      if (options?.appId) {
        console.log('[SDK] uploadFile: options.appId exists:', options.appId, 'type:', typeof options.appId)
        if (typeof options.appId === 'string') {
          appIdString = options.appId
          console.log('[SDK] uploadFile: using options.appId (string):', appIdString)
        } else {
          console.error('[SDK] uploadFile: options.appId is not a string:', options.appId, 'type:', typeof options.appId, 'toString:', String(options.appId))
        }
      }
      
      // 如果没有，使用 config 中的 appId
      if (!appIdString && this.config.appId) {
        console.log('[SDK] uploadFile: config.appId exists:', this.config.appId, 'type:', typeof this.config.appId)
        if (typeof this.config.appId === 'string') {
          appIdString = this.config.appId
          console.log('[SDK] uploadFile: using config.appId (string):', appIdString)
        } else {
          console.error('[SDK] uploadFile: config.appId is not a string:', this.config.appId, 'type:', typeof this.config.appId, 'toString:', String(this.config.appId))
          // 尝试转换为字符串
          const converted = String(this.config.appId)
          if (converted && converted !== '[object Object]' && converted.length > 10) {
            appIdString = converted
            console.log('[SDK] uploadFile: converted config.appId to string:', appIdString)
          }
        }
      }

      // 添加 appId 到查询参数（APISIX 会将其转换为 X-App-Id Header）
      const searchParams = new URLSearchParams()
      console.log('[SDK] uploadFile: appIdString before validation:', appIdString, 'type:', typeof appIdString)
      
      if (appIdString && typeof appIdString === 'string' && appIdString.length > 10) {
        // 再次检查，确保不是 [object Object]
        if (appIdString !== '[object Object]' && !appIdString.includes('object')) {
          searchParams.append('appId', appIdString)
          console.log('[SDK] uploadFile: appId added to query params:', appIdString)
        } else {
          console.error('[SDK] uploadFile: appIdString is invalid (contains object):', appIdString)
        }
      } else {
        console.warn('[SDK] uploadFile: no valid appId found, appIdString:', appIdString, 'options.appId:', options?.appId, 'config.appId:', this.config.appId)
      }

      // 构建最终 URL（包含 appId 查询参数）
      const finalUrl = searchParams.toString()
        ? `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}${searchParams.toString()}`
        : targetUrl

      // 构建请求头
      // 重要：当使用 FormData 作为 body 时，浏览器会自动设置 Content-Type（包含 boundary）
      // 我们不能手动设置 Content-Type，但浏览器会自动添加
      // APISIX 的 "unregister Content-Type" 错误可能是因为：
      // 1. APISIX 配置不允许 multipart/form-data
      // 2. 或者 Content-Type 的格式不符合 APISIX 的要求
      // 解决方案：让浏览器自动设置，不手动干预
      const requestHeaders: Record<string, string> = {}
      
      // 只添加必要的 headers，不设置 Content-Type（让浏览器自动设置）
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`
      }
      if (apiKey) {
        requestHeaders['X-API-Key'] = apiKey
      }
      
      // 添加其他自定义 headers（明确排除 Content-Type）
      if (options?.headers) {
        const customHeaders = options.headers as Record<string, string>
        Object.entries(customHeaders).forEach(([key, value]) => {
          const lowerKey = key.toLowerCase()
          // 明确排除 Content-Type 相关的 header
          if (lowerKey !== 'content-type' && lowerKey !== 'contenttype') {
            requestHeaders[key] = value
          }
        })
      }

      // 发起请求
      // 重要：当 body 是 FormData 时，浏览器会自动设置 Content-Type（包含 boundary）
      // APISIX 的 "unregister Content-Type" 错误可能是因为：
      // 1. APISIX 配置不允许 multipart/form-data
      // 2. 或者 Content-Type 的格式不符合 APISIX 的要求
      // 解决方案：使用 XMLHttpRequest 而不是 fetch，可以更好地控制 headers
      let response: Response
      try {
        // 使用 fetch，但确保不手动设置 Content-Type
        // 浏览器会自动设置正确的 Content-Type（包含 boundary）
        response = await fetch(finalUrl, {
          method: 'POST',
          body: formData,
          // 只传递必要的 headers（Authorization, X-API-Key 等）
          // 不设置 Content-Type，让浏览器自动设置
          headers: Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined,
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

