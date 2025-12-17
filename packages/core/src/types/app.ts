/**
 * App Management 类型定义
 */

export interface CreateAppRequest {
  user_id: string
  appKey?: string
  appName: string
  appType: 'web' | 'mobile' | 'desktop' | 'miniprogram'
  websiteUrl?: string
  packageName?: string
  miniprogramAppid?: string
  description?: string
}

export interface CreateAppReply {
  appId: string
  appKey: string
  appName: string
  appType: string
  createdAt: string
}

export interface AppInfo {
  appId: string
  appKey: string
  appName: string
  appType: string
  websiteUrl?: string
  packageName?: string
  miniprogramAppid?: string
  description?: string
  status: 'ACTIVE' | 'SUSPENDED'
  createdAt: string
  updatedAt: string
}

export interface ListAppsRequest {
  user_id: string
  page?: number
  pageSize?: number
}

export interface ListAppsReply {
  apps: AppInfo[]
  total: number
}

export interface GetAppReply {
  app: AppInfo
}

export interface UpdateAppRequest {
  appId: string
  appName?: string
  websiteUrl?: string
  packageName?: string
  miniprogramAppid?: string
  description?: string
}

export interface UpdateAppReply {
  success: boolean
}

export interface DeleteAppReply {
  success: boolean
}
