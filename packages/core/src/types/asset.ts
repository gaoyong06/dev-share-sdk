/**
 * Asset Service 类型定义
 */

export interface UploadFileResponse {
  fileId: string
  name: string
  size: number
  contentType: string
  type: string
  storageType: string
  storagePath: string
  hash: string
  uploadedBy: string
  createdAt: string
  metadata?: Record<string, string>
  url: string // 文件访问URL（直接返回，方便业务方调用）
}

export interface GetFileInfoReply {
  fileId: string
  name: string
  size: number
  contentType: string
  type: string
  storageType: string
  storagePath: string
  hash: string
  uploadedBy: string
  createdAt: string
  updatedAt: string
  metadata?: Record<string, string>
  isPublic: boolean
}

export interface GetFileURLReply {
  url: string
  expireAt: number
}

export interface DeleteFileReply {
  success: boolean
}

export interface FileInfo {
  fileId: string
  name: string
  size: number
  contentType: string
  type: string
  createdAt: string
  url: string
}

export interface ListFilesReply {
  files: FileInfo[]
  total: number
}
