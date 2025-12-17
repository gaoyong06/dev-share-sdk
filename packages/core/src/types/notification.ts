/**
 * Notification Service 类型定义
 */

export interface SendNotificationRequest {
  userId: string
  templateId: string
  channels?: string[]
  params?: Record<string, string>
  priority?: number
  async?: boolean
  recipient?: string
  locale?: string
}

export interface SendNotificationReply {
  notificationId: string
  status: string
  channelResults?: Record<string, ChannelResult>
  message: string
}

export interface ChannelResult {
  success: boolean
  message: string
  provider: string
}

export interface BatchSendRequest {
  userIds: string[]
  templateId: string
  channels?: string[]
  params?: Record<string, string>
  priority?: number
}

export interface BatchSendReply {
  total: number
  success: number
  failed: number
  results: BatchSendResult[]
}

export interface BatchSendResult {
  userId: string
  success: boolean
  notificationId?: string
  errorMessage?: string
}

export interface GetStatusReply {
  notificationId: string
  userId: string
  templateId: string
  channel: string
  recipient: string
  status: string
  errorMessage?: string
  retryCount: number
  sentAt: number
  deliveredAt?: number
  createdAt: number
}

export interface NotificationRecord {
  notificationId: string
  userId: string
  templateId: string
  channel: string
  recipient: string
  status: string
  content: string
  createdAt: number
  sentAt?: number
}

export interface GetHistoryReply {
  records: NotificationRecord[]
  total: number
  page: number
  pageSize: number
}

export interface SaveTemplateRequest {
  id: string
  name: string
  channel: 'sms' | 'email' | 'push' | 'inapp'
  subject?: string
  content: string
  params?: Record<string, string>
  locale?: string
  is_active?: boolean
}

export interface SaveTemplateReply {
  success: boolean
  message: string
}

export interface ListTemplatesRequest {
  channel?: string
  locale?: string
  page?: number
  pageSize?: number
}

export interface Template {
  id: string
  name: string
  channel: string
  subject?: string
  content: string
  locale: string
  version: number
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export interface ListTemplatesReply {
  templates: Template[]
  total: number
}

export interface SetUserPreferenceRequest {
  userId: string
  preferences: Record<string, ChannelPreference>
}

export interface ChannelPreference {
  channels: string[]
  enabled: boolean
}

export interface SetUserPreferenceReply {
  success: boolean
  message: string
}

export interface GetUserPreferenceReply {
  userId: string
  preferences: Record<string, ChannelPreference>
  createdAt: number
  updatedAt: number
}
