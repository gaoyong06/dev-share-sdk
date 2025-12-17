/**
 * Short Link Service - 短链接服务
 */

import type { RequestClient } from '../client'
import type { ApiResponse } from '../types'

const BASE_PATH = '/api/v1/short-link'

// ==================== 类型定义 ====================

export interface CreateShortLinkRequest {
  userId: string
  originalUrl: string
  utmLinkId?: string
  customSuffix?: string
  expiresAt?: string
  groupId?: string
  tags?: string[]
  password?: string
}

export interface ShortLink {
  id: string
  shortCode: string
  shortUrl: string
  originalUrl: string
  utmLinkId?: string
  clickCount: number
  isActive: boolean
  createdAt: string
  groupId?: string
  tags?: string[]
  hasPassword?: boolean
}

export interface CreateShortLinkReply {
  id: string
  shortCode: string
  shortUrl: string
  originalUrl: string
  createdAt: string
}

export interface ListShortLinksRequest {
  userId: string
  page: number
  pageSize: number
  groupId?: string
  tags?: string[]
  search?: string
}

export interface ListShortLinksReply {
  links: ShortLink[]
  total: number
}

export interface BatchCreateItem {
  originalUrl: string
  utmLinkId?: string
  customSuffix?: string
  expiresAt?: string
}

export interface BatchCreateShortLinksRequest {
  userId: string
  items: BatchCreateItem[]
}

export interface BatchCreateError {
  index: number
  originalUrl: string
  errorMessage: string
}

export interface BatchCreateShortLinksReply {
  links: CreateShortLinkReply[]
  successCount: number
  totalCount: number
  errors: BatchCreateError[]
}

export interface UpdateShortLinkRequest {
  shortCode: string
  groupId?: string
  tags?: string[]
  password?: string
  isActive?: boolean
  expiresAt?: string
}

export interface UpdateShortLinkReply {
  shortCode: string
  success: boolean
}

export interface GetShortLinkStatsRequest {
  shortCode: string
  startDate: string
  endDate: string
}

export interface StatItem {
  key: string
  value: number
}

export interface GetShortLinkStatsReply {
  shortCode: string
  totalClicks: number
  deviceStats: StatItem[]
  browserStats: StatItem[]
  osStats: StatItem[]
  provinceStats: StatItem[]
  refererStats: StatItem[]
  hourlyStats: StatItem[]
}

export interface GetRealTimeStatsRequest {
  shortCode: string
  minutes?: number
}

export interface GetRealTimeStatsReply {
  shortCode: string
  clicksLastMinute: number
  clicksLast5Minutes: number
  clicksLast15Minutes: number
  clicksLastHour: number
  recentClicks: StatItem[]
}

export interface GetTrendStatsRequest {
  shortCode: string
  startDate: string
  endDate: string
  period: 'hour' | 'day' | 'week' | 'month'
}

export interface TrendDataPoint {
  time: string
  clicks: number
}

export interface GetTrendStatsReply {
  shortCode: string
  period: string
  dataPoints: TrendDataPoint[]
}

export interface GetSourceAnalysisRequest {
  shortCode: string
  startDate: string
  endDate: string
}

export interface SourceAnalysis {
  sourceType: string
  sourceName: string
  clicks: number
  percentage: number
}

export interface GetSourceAnalysisReply {
  shortCode: string
  sources: SourceAnalysis[]
  totalClicks: number
}

export interface GetUserProfileRequest {
  shortCode: string
  startDate: string
  endDate: string
}

export interface UserProfile {
  deviceDistribution: StatItem[]
  browserDistribution: StatItem[]
  osDistribution: StatItem[]
  regionDistribution: StatItem[]
}

export interface GetUserProfileReply {
  shortCode: string
  profile: UserProfile
}

export interface GetFunnelAnalysisRequest {
  shortCode: string
  startDate: string
  endDate: string
}

export interface FunnelStep {
  stepName: string
  count: number
  conversionRate: number
}

export interface GetFunnelAnalysisReply {
  shortCode: string
  steps: FunnelStep[]
}

export interface CreateGroupRequest {
  userId: string
  name: string
  description?: string
}

export interface Group {
  id: string
  name: string
  description?: string
  linkCount: number
  createdAt: string
}

export interface CreateGroupReply {
  id: string
  name: string
  createdAt: string
}

export interface ListGroupsRequest {
  userId: string
}

export interface ListGroupsReply {
  groups: Group[]
}

export interface SearchTagsRequest {
  userId: string
  query?: string
  limit?: number
}

export interface SearchTagsReply {
  tags: string[]
  total: number
}

export interface GenerateQRCodeRequest {
  shortCode: string
  size?: number
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

export interface GenerateQRCodeReply {
  qrcodeBase64: string
  qrcodeUrl?: string
  size: number
}

// ==================== ShortLinkService 类 ====================

export class ShortLinkService {
  private client: RequestClient

  constructor(client: RequestClient) {
    this.client = client
  }

  /**
   * 创建短链接
   */
  async createShortLink(
    request: CreateShortLinkRequest
  ): Promise<ApiResponse<CreateShortLinkReply>> {
    return this.client.post(`${BASE_PATH}`, request)
  }

  /**
   * 获取短链接信息
   */
  async getShortLink(shortCode: string): Promise<ApiResponse<ShortLink>> {
    return this.client.get(`${BASE_PATH}/${shortCode}`)
  }

  /**
   * 获取短链接列表
   */
  async listShortLinks(
    request: ListShortLinksRequest
  ): Promise<ApiResponse<ListShortLinksReply>> {
    return this.client.get(`${BASE_PATH}s`, {
      params: {
        userId: request.userId,
        page: request.page,
        pageSize: request.pageSize,
        ...(request.groupId && { groupId: request.groupId }),
        ...(request.tags && { tags: request.tags }),
        ...(request.search && { search: request.search }),
      },
    })
  }

  /**
   * 批量创建短链接
   */
  async batchCreateShortLinks(
    request: BatchCreateShortLinksRequest
  ): Promise<ApiResponse<BatchCreateShortLinksReply>> {
    return this.client.post(`${BASE_PATH}s/batch`, request)
  }

  /**
   * 更新短链接
   */
  async updateShortLink(
    request: UpdateShortLinkRequest
  ): Promise<ApiResponse<UpdateShortLinkReply>> {
    const { shortCode, ...body } = request
    return this.client.put(`${BASE_PATH}/${shortCode}`, body)
  }

  /**
   * 获取短链接统计
   */
  async getShortLinkStats(
    request: GetShortLinkStatsRequest
  ): Promise<ApiResponse<GetShortLinkStatsReply>> {
    return this.client.get(`${BASE_PATH}/${request.shortCode}/stats`, {
      params: {
        startDate: request.startDate,
        endDate: request.endDate,
      },
    })
  }

  /**
   * 获取实时统计
   */
  async getRealTimeStats(
    request: GetRealTimeStatsRequest
  ): Promise<ApiResponse<GetRealTimeStatsReply>> {
    return this.client.get(`${BASE_PATH}/${request.shortCode}/realtime-stats`, {
      params: {
        minutes: request.minutes || 60,
      },
    })
  }

  /**
   * 获取趋势统计
   */
  async getTrendStats(
    request: GetTrendStatsRequest
  ): Promise<ApiResponse<GetTrendStatsReply>> {
    return this.client.get(`${BASE_PATH}/${request.shortCode}/trend-stats`, {
      params: {
        startDate: request.startDate,
        endDate: request.endDate,
        period: request.period,
      },
    })
  }

  /**
   * 获取来源分析
   */
  async getSourceAnalysis(
    request: GetSourceAnalysisRequest
  ): Promise<ApiResponse<GetSourceAnalysisReply>> {
    return this.client.get(`${BASE_PATH}/${request.shortCode}/source-analysis`, {
      params: {
        startDate: request.startDate,
        endDate: request.endDate,
      },
    })
  }

  /**
   * 获取用户画像
   */
  async getUserProfile(
    request: GetUserProfileRequest
  ): Promise<ApiResponse<GetUserProfileReply>> {
    return this.client.get(`${BASE_PATH}/${request.shortCode}/user-profile`, {
      params: {
        startDate: request.startDate,
        endDate: request.endDate,
      },
    })
  }

  /**
   * 获取漏斗分析
   */
  async getFunnelAnalysis(
    request: GetFunnelAnalysisRequest
  ): Promise<ApiResponse<GetFunnelAnalysisReply>> {
    return this.client.get(`${BASE_PATH}/${request.shortCode}/funnel-analysis`, {
      params: {
        startDate: request.startDate,
        endDate: request.endDate,
      },
    })
  }

  /**
   * 创建分组
   */
  async createGroup(request: CreateGroupRequest): Promise<ApiResponse<CreateGroupReply>> {
    return this.client.post(`${BASE_PATH}-groups`, request)
  }

  /**
   * 获取分组列表
   */
  async listGroups(request: ListGroupsRequest): Promise<ApiResponse<ListGroupsReply>> {
    return this.client.get(`${BASE_PATH}-groups`, {
      params: {
        userId: request.userId,
      },
    })
  }

  /**
   * 搜索标签
   */
  async searchTags(request: SearchTagsRequest): Promise<ApiResponse<SearchTagsReply>> {
    return this.client.get(`${BASE_PATH}-tags`, {
      params: {
        userId: request.userId,
        ...(request.query && { query: request.query }),
        ...(request.limit && { limit: request.limit }),
      },
    })
  }

  /**
   * 生成二维码
   */
  async generateQRCode(
    request: GenerateQRCodeRequest
  ): Promise<ApiResponse<GenerateQRCodeReply>> {
    return this.client.get(`${BASE_PATH}/${request.shortCode}/qrcode`, {
      params: {
        size: request.size || 256,
        errorCorrectionLevel: request.errorCorrectionLevel || 'M',
      },
    })
  }
}
