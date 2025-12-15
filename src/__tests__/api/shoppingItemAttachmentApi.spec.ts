import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shoppingItemAttachmentApi } from '@/api/shoppingItemAttachmentApi'
import { apiClient } from '@/api/client'
import type { ShoppingItemAttachmentModel } from '@/domain'

// apiClient をモック
vi.mock('@/api/client', () => {
  return {
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    },
  }
})

// ★ ここを vi.mocked ではなく、手動キャストにする
type MockedApiClient = {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

const mockedClient = apiClient as unknown as MockedApiClient

describe('shoppingItemAttachmentApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createUploadUrl: POST /upload-url に正しくリクエストし、レスポンスの data を返す', async () => {
    mockedClient.post.mockResolvedValue({
      data: {
        uploadUrl: 'https://upload.example.com/xxx',
        fileKey: 'file-key-123',
      },
    })

    const result = await shoppingItemAttachmentApi.createUploadUrl(10, {
      fileName: 'image.png',
      mimeType: 'image/png',
    })

    expect(mockedClient.post).toHaveBeenCalledTimes(1)
    const args = mockedClient.post.mock.calls[0]!
    expect(args[0]).toBe('/api/shopping-items/10/attachments/upload-url')
    expect(args[1]).toEqual({
      fileName: 'image.png',
      mimeType: 'image/png',
    })

    expect(result).toEqual({
      uploadUrl: 'https://upload.example.com/xxx',
      fileKey: 'file-key-123',
    })
  })

  it('createAttachment: POST /attachments に正しくリクエストする（戻り値なし）', async () => {
    mockedClient.post.mockResolvedValue({ data: { id: 1 } })

    await shoppingItemAttachmentApi.createAttachment(20, {
      fileKey: 'file-key-456',
      fileName: 'receipt.jpg',
      mimeType: 'image/jpeg',
    })

    expect(mockedClient.post).toHaveBeenCalledTimes(1)
    const args = mockedClient.post.mock.calls[0]!
    expect(args[0]).toBe('/api/shopping-items/20/attachments')
    expect(args[1]).toEqual({
      fileKey: 'file-key-456',
      fileName: 'receipt.jpg',
      mimeType: 'image/jpeg',
    })
  })

  it('listAttachments: GET /attachments して DTO を ShoppingItemAttachmentModel[] に変換する', async () => {
    mockedClient.get.mockResolvedValue({
      data: [
        {
          id: 1,
          fileName: 'a.png',
          imageUrl: 'https://example.com/a.png',
          sortOrder: 1,
        },
        {
          id: 2,
          fileName: 'b.png',
          imageUrl: 'https://example.com/b.png',
          sortOrder: 2,
        },
      ],
    })

    const result = await shoppingItemAttachmentApi.listAttachments(30)

    expect(mockedClient.get).toHaveBeenCalledTimes(1)
    expect(mockedClient.get).toHaveBeenCalledWith('/api/shopping-items/30/attachments')

    const expected: ShoppingItemAttachmentModel[] = [
      {
        id: 1,
        fileName: 'a.png',
        imageUrl: 'https://example.com/a.png',
        sortOrder: 1,
      },
      {
        id: 2,
        fileName: 'b.png',
        imageUrl: 'https://example.com/b.png',
        sortOrder: 2,
      },
    ]
    expect(result).toEqual(expected)
  })

  it('deleteAttachment: DELETE /attachments/{id} を呼び出す', async () => {
    mockedClient.delete.mockResolvedValue({ data: undefined })

    await shoppingItemAttachmentApi.deleteAttachment(40, 999)

    expect(mockedClient.delete).toHaveBeenCalledTimes(1)
    expect(mockedClient.delete).toHaveBeenCalledWith('/api/shopping-items/40/attachments/999')
  })
})
