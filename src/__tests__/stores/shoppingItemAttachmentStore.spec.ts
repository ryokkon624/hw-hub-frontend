import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useShoppingItemAttachmentStore } from '@/stores/shoppingItemAttachmentStore'
import { shoppingItemAttachmentApi } from '@/api/shoppingItemAttachmentApi'
import type { ShoppingItemAttachmentModel } from '@/domain'

const testGlobal = globalThis as typeof globalThis & {
  fetch: typeof fetch
}

vi.mock('@/api/shoppingItemAttachmentApi', () => ({
  shoppingItemAttachmentApi: {
    listAttachments: vi.fn(),
    createUploadUrl: vi.fn(),
    createAttachment: vi.fn(),
    deleteAttachment: vi.fn(),
  },
}))

const createAttachment = (
  overrides: Partial<ShoppingItemAttachmentModel> = {},
): ShoppingItemAttachmentModel =>
  ({
    id: 1,
    shoppingItemId: 1,
    imageUrl: 'https://example.com/image1.png',
    sortOrder: 1,
    fileName: 'image1.png',
    mimeType: 'image/png',
    ...overrides,
  }) as ShoppingItemAttachmentModel

describe('shoppingItemAttachmentStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    // fetch をモック
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    testGlobal.fetch = fetchMock
  })

  it('firstImageUrl getter は先頭添付の imageUrl を返す', () => {
    const store = useShoppingItemAttachmentStore()
    const a1 = createAttachment({ id: 1, imageUrl: 'https://example.com/1.png' })
    const a2 = createAttachment({ id: 2, imageUrl: 'https://example.com/2.png' })
    store.attachmentsByItemId[10] = [a1, a2]

    expect(store.firstImageUrl(10)).toBe('https://example.com/1.png')
  })

  it('firstImageUrl getter は添付がないとき undefined を返す', () => {
    const store = useShoppingItemAttachmentStore()
    expect(store.firstImageUrl(999)).toBeUndefined()
  })

  it('attachments getter は指定 itemId の配列を返し、なければ空配列を返す', () => {
    const store = useShoppingItemAttachmentStore()
    const a1 = createAttachment({ id: 1 })
    store.attachmentsByItemId[1] = [a1]

    expect(store.attachments(1)).toEqual([a1])
    expect(store.attachments(999)).toEqual([])
  })

  it('isUploading getter は uploadingItemIds に含まれているかを返す', () => {
    const store = useShoppingItemAttachmentStore()
    store.uploadingItemIds = [1, 2]

    expect(store.isUploading(1)).toBe(true)
    expect(store.isUploading(3)).toBe(false)
  })

  it('fetchAttachments 初回は listAttachments を呼び、sortOrder でソートしてセットする', async () => {
    const store = useShoppingItemAttachmentStore()

    const a1 = createAttachment({ id: 1, sortOrder: 2 })
    const a2 = createAttachment({ id: 2, sortOrder: 1 })

    vi.mocked(shoppingItemAttachmentApi.listAttachments).mockResolvedValue([a1, a2])

    await store.fetchAttachments(10)

    expect(shoppingItemAttachmentApi.listAttachments).toHaveBeenCalledWith(10)

    const list = store.attachmentsByItemId[10]!
    expect(list).toHaveLength(2)
    // sortOrder 昇順になっていること
    expect(list[0]!.sortOrder).toBe(1)
    expect(list[1]!.sortOrder).toBe(2)
  })

  it('fetchAttachments 2回目以降は同じ配列参照を保ったまま中身だけ差し替える', async () => {
    const store = useShoppingItemAttachmentStore()

    const initial = [createAttachment({ id: 1, sortOrder: 1 })]
    store.attachmentsByItemId[10] = initial

    const next = [
      createAttachment({ id: 2, sortOrder: 1 }),
      createAttachment({ id: 3, sortOrder: 2 }),
    ]

    vi.mocked(shoppingItemAttachmentApi.listAttachments).mockResolvedValue(next)

    const beforeRef = store.attachmentsByItemId[10]
    await store.fetchAttachments(10)
    const afterRef = store.attachmentsByItemId[10]

    // 参照は同じ
    expect(afterRef).toBe(beforeRef)
    // 中身は置き換わっている
    expect(afterRef).toHaveLength(2)
    expect(afterRef[0]!.id).toBe(2)
    expect(afterRef[1]!.id).toBe(3)
  })

  it('uploadAttachment は uploadingItemIds を更新し、API を順番に呼び、最後に attachments を再取得する', async () => {
    const store = useShoppingItemAttachmentStore()
    const file = new File(['dummy'], 'test.png', { type: 'image/png' })

    vi.mocked(shoppingItemAttachmentApi.createUploadUrl).mockResolvedValue({
      uploadUrl: 'https://upload.example.com',
      fileKey: 'file-key',
    })
    vi.mocked(shoppingItemAttachmentApi.createAttachment).mockResolvedValue(undefined)

    const fetchAttachmentsSpy = vi.spyOn(store, 'fetchAttachments').mockResolvedValue(undefined)

    await store.uploadAttachment(10, file)

    // uploading 中の管理
    expect(store.uploadingItemIds.includes(10)).toBe(false) // finally で消えている

    // presigned URL
    expect(shoppingItemAttachmentApi.createUploadUrl).toHaveBeenCalledWith(10, {
      fileName: file.name,
      mimeType: file.type,
    })

    // fetch で PUT
    expect(globalThis.fetch).toHaveBeenCalledWith('https://upload.example.com', {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    })

    // メタ情報登録
    expect(shoppingItemAttachmentApi.createAttachment).toHaveBeenCalledWith(10, {
      fileKey: 'file-key',
      fileName: file.name,
      mimeType: file.type,
    })

    // 一覧再取得
    expect(fetchAttachmentsSpy).toHaveBeenCalledWith(10)
  })

  it('deleteAttachment は API 呼び出し後、該当添付だけを state から削除する', async () => {
    const store = useShoppingItemAttachmentStore()
    const a1 = createAttachment({ id: 1 })
    const a2 = createAttachment({ id: 2 })
    store.attachmentsByItemId[10] = [a1, a2]

    vi.mocked(shoppingItemAttachmentApi.deleteAttachment).mockResolvedValue(undefined)

    await store.deleteAttachment(10, 1)

    expect(shoppingItemAttachmentApi.deleteAttachment).toHaveBeenCalledWith(10, 1)
    const list = store.attachmentsByItemId[10]
    expect(list).toHaveLength(1)
    expect(list[0]!.id).toBe(2)
  })
})
