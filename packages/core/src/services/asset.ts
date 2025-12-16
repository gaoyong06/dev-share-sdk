// Asset Service API - 文件上传相关接口

import { RequestClient } from '../client/request'
import type {
  UploadFileResponse,
  FileInfo,
  GetFileInfoReply,
  GetFileURLReply,
  DeleteFileReply,
  ListFilesReply,
  ApiResponse,
} from '../types'

const BASE_PATH = '/api/v1/files'

export class AssetService {
  private client: RequestClient

  constructor(client: RequestClient) {
    this.client = client
  }

  /**
   * 上传文件到 asset-service
   * @param file 要上传的文件
   * @param metadata 文件元数据（可选）
   * @param appId App ID（可选）
   * @returns 上传结果，包含 fileId
   */
  async uploadFile(
    file: File,
    metadata?: Record<string, string>,
    appId?: string
  ): Promise<ApiResponse<UploadFileResponse>> {
    return this.client.uploadFile<UploadFileResponse>(
      `${BASE_PATH}/upload`,
      file,
      metadata,
      {
        appId,
      }
    )
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(fileId: string): Promise<ApiResponse<GetFileInfoReply>> {
    return this.client.get<GetFileInfoReply>(`${BASE_PATH}/${fileId}`)
  }

  /**
   * 获取文件访问 URL
   */
  async getFileURL(fileId: string, expireSeconds?: number): Promise<ApiResponse<GetFileURLReply>> {
    return this.client.get<GetFileURLReply>(`${BASE_PATH}/${fileId}/url`, {
      params: {
        ...(expireSeconds && { expireSeconds }),
      },
    })
  }

  /**
   * 删除文件
   */
  async deleteFile(fileId: string): Promise<ApiResponse<DeleteFileReply>> {
    return this.client.delete<DeleteFileReply>(`${BASE_PATH}/${fileId}`)
  }

  /**
   * 列出文件
   */
  async listFiles(params: {
    page?: number
    pageSize?: number
    businessType?: string
    source?: string
    appId?: string
  }): Promise<ApiResponse<ListFilesReply>> {
    const { page = 1, pageSize = 20, businessType, source, appId } = params
    return this.client.get<ListFilesReply>(BASE_PATH, {
      params: {
        page,
        pageSize,
        ...(businessType && { businessType }),
        ...(source && { source }),
      },
      appId,
    })
  }
}

