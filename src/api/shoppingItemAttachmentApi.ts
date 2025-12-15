import { apiClient } from '@/api/client'
import type { ShoppingItemAttachmentModel } from '@/domain'

export const shoppingItemAttachmentApi = {
  /**
   * ファイルUpload用のURL、ファイルのキーを取得する。
   * @param itemId 買い物アイテムID
   * @param body
   * @returns response
   */
  async createUploadUrl(itemId: number, body: CreateUploadUrlRequestDto) {
    const res = await apiClient.post<CreateUploadUrlResponseDto>(
      `/api/shopping-items/${itemId}/attachments/upload-url`,
      body,
    )
    return res.data
  },

  /**
   * 添付ファイルを登録する。
   * @param itemId 買い物アイテムID
   * @param body
   */
  async createAttachment(itemId: number, body: CreateAttachmentRequestDto) {
    await apiClient.post<CreateAttachmentResponseDto>(
      `/api/shopping-items/${itemId}/attachments`,
      body,
    )
  },

  /**
   * 指定された買い物アイテムIDの添付ファイルを取得する。
   * @param itemId 買い物アイテムID
   * @returns 添付ファイルDomain Model
   */
  async listAttachments(itemId: number): Promise<ShoppingItemAttachmentModel[]> {
    const res = await apiClient.get<ShoppingItemAttachmentResponseDto[]>(
      `/api/shopping-items/${itemId}/attachments`,
    )
    return res.data.map(toShoppingItemAttachment)
  },

  /**
   * 指定された添付ファイルを削除する。
   * @param itemId 買い物アイテムID
   * @param attachmentId 買い物アイテム添付ファイルID
   */
  async deleteAttachment(itemId: number, attachmentId: number): Promise<void> {
    await apiClient.delete<void>(`/api/shopping-items/${itemId}/attachments/${attachmentId}`)
  },
}

// ---- API DTO ----------------------------------------------------

/**
 * Upload用URL作成Request用のDTO
 */
interface CreateUploadUrlRequestDto {
  fileName: string
  mimeType: string
}

/**
 * Upload用URL作成Response用のDTO
 */
interface CreateUploadUrlResponseDto {
  uploadUrl: string
  fileKey: string
}

/**
 * 添付ファイル登録Request用のDTO
 */
interface CreateAttachmentRequestDto {
  fileKey: string
  fileName: string
  mimeType: string
}

/**
 * 添付ファイル登録Respoinse用のDTO
 */
interface CreateAttachmentResponseDto {
  id: number
}

/**
 * 買い物アイテムの添付ファイル取得Response用のDTO
 */
interface ShoppingItemAttachmentResponseDto {
  id: number
  fileName: string
  imageUrl: string
  sortOrder: number
}

// ---- Mapper: DTO ⇔ Domain ----------------------------------------------------

/**
 * Response DTO → Domain Modelへの変換
 * @param dto Response DTO
 * @returns Domain Model
 */
const toShoppingItemAttachment = (
  dto: ShoppingItemAttachmentResponseDto,
): ShoppingItemAttachmentModel => ({
  id: dto.id,
  fileName: dto.fileName,
  imageUrl: dto.imageUrl,
  sortOrder: dto.sortOrder,
})
