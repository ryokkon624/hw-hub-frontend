import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useInquiryStore } from '@/stores/inquiryStore'
import { inquiryApi } from '@/api/inquiryApi'
import { INQUIRY_CATEGORY, INQUIRY_STATUS, INQUIRY_SENDER_TYPE } from '@/constants/code.constants'
import type { InquirySummary, InquiryDetail } from '@/domain'

vi.mock('@/api/inquiryApi', () => ({
  inquiryApi: {
    fetchInquiries: vi.fn(),
    fetchInquiry: vi.fn(),
    createInquiry: vi.fn(),
    addMessage: vi.fn(),
    closeInquiry: vi.fn(),
    escalateToStaff: vi.fn(),
  },
}))

describe('inquiryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const createSummary = (id: number): InquirySummary => ({
    inquiryId: id,
    category: INQUIRY_CATEGORY.GENERAL,
    status: INQUIRY_STATUS.OPEN,
    title: `問い合わせ ${id}`,
    createdAt: new Date('2026-01-01T00:00:00Z'),
  })

  const createDetail = (id: number, status = INQUIRY_STATUS.OPEN): InquiryDetail => ({
    inquiryId: id,
    category: INQUIRY_CATEGORY.GENERAL,
    status,
    title: `問い合わせ ${id}`,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    messages: [
      {
        messageId: 1,
        seq: 1,
        senderType: INQUIRY_SENDER_TYPE.USER,
        body: 'メッセージ',
        createdAt: new Date('2026-01-01T00:01:00Z'),
      },
    ],
  })

  describe('loadAll', () => {
    it('問い合わせ一覧を取得し、summariesに格納する', async () => {
      const summaries = [createSummary(1), createSummary(2)]
      vi.mocked(inquiryApi.fetchInquiries).mockResolvedValue(summaries)

      const store = useInquiryStore()
      const promise = store.loadAll()

      expect(store.isLoading).toBe(true)
      await promise

      expect(store.isLoading).toBe(false)
      expect(store.summaries).toEqual(summaries)
      expect(inquiryApi.fetchInquiries).toHaveBeenCalledOnce()
    })

    it('API通信エラー時にisLoadingがfalseに戻る', async () => {
      vi.mocked(inquiryApi.fetchInquiries).mockRejectedValue(new Error('Network error'))

      const store = useInquiryStore()
      await expect(store.loadAll()).rejects.toThrow('Network error')

      expect(store.isLoading).toBe(false)
    })
  })

  describe('loadDetail', () => {
    it('問い合わせ詳細を取得し、currentDetailに格納する', async () => {
      const detail = createDetail(5)
      vi.mocked(inquiryApi.fetchInquiry).mockResolvedValue(detail)

      const store = useInquiryStore()
      const promise = store.loadDetail(5)

      expect(store.isLoading).toBe(true)
      await promise

      expect(store.isLoading).toBe(false)
      expect(store.currentDetail).toEqual(detail)
      expect(inquiryApi.fetchInquiry).toHaveBeenCalledWith(5)
    })

    it('API通信エラー時にisLoadingがfalseに戻る', async () => {
      vi.mocked(inquiryApi.fetchInquiry).mockRejectedValue(new Error('Not found'))

      const store = useInquiryStore()
      await expect(store.loadDetail(99)).rejects.toThrow('Not found')

      expect(store.isLoading).toBe(false)
    })
  })

  describe('create', () => {
    it('問い合わせを作成し、一覧を再取得してinquiryIdを返す', async () => {
      vi.mocked(inquiryApi.createInquiry).mockResolvedValue({ inquiryId: 10 })
      vi.mocked(inquiryApi.fetchInquiries).mockResolvedValue([createSummary(10)])

      const store = useInquiryStore()
      const inquiryId = await store.create({
        category: INQUIRY_CATEGORY.GENERAL,
        title: 'テスト',
        body: '内容',
      })

      expect(inquiryId).toBe(10)
      expect(inquiryApi.createInquiry).toHaveBeenCalledOnce()
      expect(inquiryApi.fetchInquiries).toHaveBeenCalledOnce()
      expect(store.isSubmitting).toBe(false)
    })

    it('isSubmittingがtrueの場合はエラーをthrowする', async () => {
      const store = useInquiryStore()
      store.isSubmitting = true

      await expect(
        store.create({
          category: INQUIRY_CATEGORY.GENERAL,
          title: 'テスト',
          body: '内容',
        }),
      ).rejects.toThrow('送信中です')

      expect(inquiryApi.createInquiry).not.toHaveBeenCalled()
    })

    it('API通信エラー時にisSubmittingがfalseに戻る', async () => {
      vi.mocked(inquiryApi.createInquiry).mockRejectedValue(new Error('Server error'))

      const store = useInquiryStore()
      await expect(
        store.create({
          category: INQUIRY_CATEGORY.GENERAL,
          title: 'テスト',
          body: '内容',
        }),
      ).rejects.toThrow('Server error')

      expect(store.isSubmitting).toBe(false)
    })
  })

  describe('addMessage', () => {
    it('メッセージを送信し、詳細を再取得する', async () => {
      vi.mocked(inquiryApi.addMessage).mockResolvedValue(undefined)
      vi.mocked(inquiryApi.fetchInquiry).mockResolvedValue(createDetail(5))

      const store = useInquiryStore()
      await store.addMessage(5, 'メッセージ内容')

      expect(inquiryApi.addMessage).toHaveBeenCalledWith(5, 'メッセージ内容')
      expect(inquiryApi.fetchInquiry).toHaveBeenCalledWith(5)
      expect(store.isSubmitting).toBe(false)
    })

    it('isSubmittingがtrueの場合は何もしない', async () => {
      const store = useInquiryStore()
      store.isSubmitting = true

      await store.addMessage(5, 'メッセージ')

      expect(inquiryApi.addMessage).not.toHaveBeenCalled()
    })

    it('API通信エラー時にisSubmittingがfalseに戻る', async () => {
      vi.mocked(inquiryApi.addMessage).mockRejectedValue(new Error('Error'))

      const store = useInquiryStore()
      await expect(store.addMessage(5, 'msg')).rejects.toThrow('Error')

      expect(store.isSubmitting).toBe(false)
    })
  })

  describe('closeInquiry', () => {
    it('問い合わせをクローズし、currentDetailのstatusをCLOSEDに更新する', async () => {
      vi.mocked(inquiryApi.closeInquiry).mockResolvedValue(undefined)

      const store = useInquiryStore()
      store.currentDetail = createDetail(5)

      await store.closeInquiry(5)

      expect(inquiryApi.closeInquiry).toHaveBeenCalledWith(5)
      expect(store.currentDetail?.status).toBe(INQUIRY_STATUS.CLOSED)
      expect(store.isSubmitting).toBe(false)
    })

    it('currentDetailのinquiryIdが一致しない場合はstatusを更新しない', async () => {
      vi.mocked(inquiryApi.closeInquiry).mockResolvedValue(undefined)

      const store = useInquiryStore()
      store.currentDetail = createDetail(5)

      await store.closeInquiry(99)

      expect(store.currentDetail?.status).toBe(INQUIRY_STATUS.OPEN)
    })

    it('currentDetailがnullの場合もstatusの更新はスキップされる', async () => {
      vi.mocked(inquiryApi.closeInquiry).mockResolvedValue(undefined)

      const store = useInquiryStore()
      store.currentDetail = null

      await store.closeInquiry(5)

      expect(store.currentDetail).toBeNull()
    })

    it('isSubmittingがtrueの場合は何もしない', async () => {
      const store = useInquiryStore()
      store.isSubmitting = true

      await store.closeInquiry(5)

      expect(inquiryApi.closeInquiry).not.toHaveBeenCalled()
    })

    it('API通信エラー時にisSubmittingがfalseに戻る', async () => {
      vi.mocked(inquiryApi.closeInquiry).mockRejectedValue(new Error('Error'))

      const store = useInquiryStore()
      await expect(store.closeInquiry(5)).rejects.toThrow('Error')

      expect(store.isSubmitting).toBe(false)
    })
  })

  describe('escalateToStaff', () => {
    it('スタッフへエスカレーションし、currentDetailのstatusをPENDING_STAFFに更新する', async () => {
      vi.mocked(inquiryApi.escalateToStaff).mockResolvedValue(undefined)

      const store = useInquiryStore()
      store.currentDetail = createDetail(5)

      await store.escalateToStaff(5)

      expect(inquiryApi.escalateToStaff).toHaveBeenCalledWith(5)
      expect(store.currentDetail?.status).toBe(INQUIRY_STATUS.PENDING_STAFF)
      expect(store.isSubmitting).toBe(false)
    })

    it('currentDetailのinquiryIdが一致しない場合はstatusを更新しない', async () => {
      vi.mocked(inquiryApi.escalateToStaff).mockResolvedValue(undefined)

      const store = useInquiryStore()
      store.currentDetail = createDetail(5)

      await store.escalateToStaff(99)

      expect(store.currentDetail?.status).toBe(INQUIRY_STATUS.OPEN)
    })

    it('currentDetailがnullの場合もstatusの更新はスキップされる', async () => {
      vi.mocked(inquiryApi.escalateToStaff).mockResolvedValue(undefined)

      const store = useInquiryStore()
      store.currentDetail = null

      await store.escalateToStaff(5)

      expect(store.currentDetail).toBeNull()
    })

    it('isSubmittingがtrueの場合は何もしない', async () => {
      const store = useInquiryStore()
      store.isSubmitting = true

      await store.escalateToStaff(5)

      expect(inquiryApi.escalateToStaff).not.toHaveBeenCalled()
    })

    it('API通信エラー時にisSubmittingがfalseに戻る', async () => {
      vi.mocked(inquiryApi.escalateToStaff).mockRejectedValue(new Error('Error'))

      const store = useInquiryStore()
      await expect(store.escalateToStaff(5)).rejects.toThrow('Error')

      expect(store.isSubmitting).toBe(false)
    })
  })

  describe('clear', () => {
    it('全ての状態を初期値にリセットする', () => {
      const store = useInquiryStore()
      store.summaries = [createSummary(1), createSummary(2)]
      store.currentDetail = createDetail(1)
      store.isLoading = true
      store.isSubmitting = true

      store.clear()

      expect(store.summaries).toEqual([])
      expect(store.currentDetail).toBeNull()
      expect(store.isLoading).toBe(false)
      expect(store.isSubmitting).toBe(false)
    })
  })
})
