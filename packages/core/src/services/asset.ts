/**
 * Asset Service - 文件上传、存储、管理
 */

import type { RequestClient } from '../client'
import type {
  UploadFileResponse,
  GetFileInfoReply,
  GetFileURLReply,
  DeleteFileReply,
  ListFilesReply,
  ApiResponse,
} from '../types'

const BASE_PATH = '/api/v1/files'

export class AssetService {
  constructor(private client: RequestClient) {}

  /**
   * 上传文件
   */
  async uploadFile(
    file: File,
    metadata?: Record<string, string>,
    appId?: string
  ): Promise<ApiResponse<UploadFileResponse>> {
    return this.client.uploadFile<UploadFileResponse>(
      BASE_PATH,
      file,
      metadata,
      { appId }
    )
  }

  /**
   * 下载文件
   */
  async downloadFile(
    fileId: string
  ): Promise<ApiResponse<Blob>> {
    // 注意：下载文件返回的是 Blob，需要特殊处理
    // 这里先返回 URL，实际下载由调用方处理
    const urlResult = await this.getFileURL(fileId)
    if (urlResult.error) {
      return urlResult as ApiResponse<Blob>
    }
    // 返回 URL 字符串，调用方可以使用 fetch 下载
    return urlResult as unknown as ApiResponse<Blob>
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(fileId: string): Promise<ApiResponse<GetFileInfoReply>> {
    return this.client.get<GetFileInfoReply>(`${BASE_PATH}/${fileId}`)
  }

  /**
   * 获取文件 URL
   */
  async getFileURL(
    fileId: string,
    expireSeconds?: number
  ): Promise<ApiResponse<GetFileURLReply>> {
    return this.client.get<GetFileURLReply>(
      `${BASE_PATH}/${fileId}/url`,
      {
        params: expireSeconds ? { expireSeconds } : undefined,
      }
    )
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
  async listFiles(
    params?: {
      page?: number
      pageSize?: number
      type?: string
    },
    appId?: string
  ): Promise<ApiResponse<ListFilesReply>> {
    return this.client.get<ListFilesReply>(BASE_PATH, {
      params,
      appId,
    })
  }
}
