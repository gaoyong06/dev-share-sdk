// 认证管理工具

import type { SDKConfig } from '../types/config'

export class AuthManager {
  private config: SDKConfig

  constructor(config: SDKConfig) {
    this.config = config
  }

  /**
   * 获取存储的 token
   */
  getToken(): string | null {
    if (this.config.customTokenGetter) {
      return this.config.customTokenGetter()
    }

    if (typeof window === 'undefined') {
      return null
    }

    const tokenKey = this.config.tokenKey || 'access_token'
    const storage = this.getStorage()
    
    if (!storage) {
      return null
    }

    return storage.getItem(tokenKey)
  }

  /**
   * 设置 token
   */
  setToken(token: string): void {
    if (this.config.customTokenSetter) {
      this.config.customTokenSetter(token)
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    const tokenKey = this.config.tokenKey || 'access_token'
    const storage = this.getStorage()
    
    if (!storage) {
      return
    }

    storage.setItem(tokenKey, token)
  }

  /**
   * 清除 token
   */
  clearToken(): void {
    if (typeof window === 'undefined') {
      return
    }

    const tokenKey = this.config.tokenKey || 'access_token'
    const storage = this.getStorage()
    
    if (!storage) {
      return
    }

    storage.removeItem(tokenKey)
  }

  /**
   * 获取存储对象
   */
  private getStorage(): Storage | null {
    if (typeof window === 'undefined') {
      return null
    }

    const storageType = this.config.tokenStorage || 'localStorage'
    
    switch (storageType) {
      case 'localStorage':
        return window.localStorage
      case 'sessionStorage':
        return window.sessionStorage
      case 'memory':
        // 内存存储（简单实现）
        return this.getMemoryStorage()
      default:
        return null
    }
  }

  /**
   * 内存存储（简单实现）
   */
  private memoryStorage: Map<string, string> = new Map()
  
  private getMemoryStorage(): Storage {
    return {
      getItem: (key: string) => this.memoryStorage.get(key) || null,
      setItem: (key: string, value: string) => this.memoryStorage.set(key, value),
      removeItem: (key: string) => this.memoryStorage.delete(key),
      clear: () => this.memoryStorage.clear(),
      length: this.memoryStorage.size,
      key: (index: number) => Array.from(this.memoryStorage.keys())[index] || null,
    } as Storage
  }
}

