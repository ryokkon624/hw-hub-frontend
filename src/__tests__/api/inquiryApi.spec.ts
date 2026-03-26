import { describe, it, expect, vi, beforeEach } from 'vitest'
import { inquiryApi } from '@/api/inquiryApi'
import { apiClient } from '@/api/client'
import { INQUIRY_CATEGORY, INQUIRY_STATUS, INQUIRY_SENDER_TYPE } from '@/constants/code.constants'

type MockedApiClient = {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
}

const mockedClient = apiClient as unknown as MockedApiClient

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('inquiryApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchInquiries', () => {
    it('APIから問い合わせ一覧を取得し、InquirySummaryの配列にマッピングして返す', async () => {
      mockedClient.get.mockResolvedValue({
        data: {
          items: [
            {
              inquiryId: 1,
              category: INQUIRY_CATEGORY.GENERAL,
              status: INQUIRY_STATUS.OPEN,
              title: 'テスト問い合わせ',
              createdAt: '2026-01-15T10:00:00Z',
            },
            {
              inquiryId: 2,
              category: INQUIRY_CATEGORY.BUG,
              status: INQUIRY_STATUS.AI_ANSWERED,
              title: '不具合報告',
              createdAt: '2026-01-20T12:00:00Z',
            },
          ],
        },
      })

      const result = await inquiryApi.fetchInquiries()

      expect(mockedClient.get).toHaveBeenCalledWith('/api/inquiries')
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        inquiryId: 1,
        category: INQUIRY_CATEGORY.GENERAL,
        status: INQUIRY_STATUS.OPEN,
        title: 'テスト問い合わせ',
        createdAt: new Date('2026-01-15T10:00:00Z'),
      })
      expect(result[1]).toEqual({
        inquiryId: 2,
        category: INQUIRY_CATEGORY.BUG,
        status: INQUIRY_STATUS.AI_ANSWERED,
        title: '不具合報告',
        createdAt: new Date('2026-01-20T12:00:00Z'),
      })
    })

    it('問い合わせが0件の場合、空配列を返す', async () => {
      mockedClient.get.mockResolvedValue({ data: { items: [] } })

      const result = await inquiryApi.fetchInquiries()

      expect(result).toHaveLength(0)
    })
  })

  describe('fetchInquiry', () => {
    it('APIから問い合わせ詳細を取得し、InquiryDetailにマッピングして返す', async () => {
      mockedClient.get.mockResolvedValue({
        data: {
          inquiryId: 5,
          category: INQUIRY_CATEGORY.HOUSEWORK,
          status: INQUIRY_STATUS.PENDING_STAFF,
          title: 'オーナーの変更について',
          createdAt: '2026-02-10T09:00:00Z',
          messages: [
            {
              messageId: 101,
              seq: 1,
              senderType: INQUIRY_SENDER_TYPE.USER,
              body: 'ご質問です',
              createdAt: '2026-02-10T09:00:00Z',
            },
            {
              messageId: 102,
              seq: 2,
              senderType: INQUIRY_SENDER_TYPE.AI,
              body: 'AI回答です',
              createdAt: '2026-02-10T09:05:00Z',
            },
            {
              messageId: 103,
              seq: 3,
              senderType: INQUIRY_SENDER_TYPE.STAFF,
              body: 'スタッフ回答です',
              createdAt: '2026-02-10T09:10:00Z',
            },
          ],
        },
      })

      const result = await inquiryApi.fetchInquiry(5)

      expect(mockedClient.get).toHaveBeenCalledWith('/api/inquiries/5')
      expect(result.inquiryId).toBe(5)
      expect(result.category).toBe(INQUIRY_CATEGORY.HOUSEWORK)
      expect(result.status).toBe(INQUIRY_STATUS.PENDING_STAFF)
      expect(result.title).toBe('オーナーの変更について')
      expect(result.createdAt).toEqual(new Date('2026-02-10T09:00:00Z'))
      expect(result.messages).toHaveLength(3)
      expect(result.messages[0]).toEqual({
        messageId: 101,
        seq: 1,
        senderType: INQUIRY_SENDER_TYPE.USER,
        body: 'ご質問です',
        createdAt: new Date('2026-02-10T09:00:00Z'),
      })
      expect(result.messages[1]?.senderType).toBe(INQUIRY_SENDER_TYPE.AI)
      expect(result.messages[2]?.senderType).toBe(INQUIRY_SENDER_TYPE.STAFF)
    })

    it('メッセージが0件の場合でも正常にマッピングできる', async () => {
      mockedClient.get.mockResolvedValue({
        data: {
          inquiryId: 3,
          category: INQUIRY_CATEGORY.ACCOUNT,
          status: INQUIRY_STATUS.OPEN,
          title: 'アカウントについて',
          createdAt: '2026-03-01T08:00:00Z',
          messages: [],
        },
      })

      const result = await inquiryApi.fetchInquiry(3)

      expect(result.messages).toHaveLength(0)
    })
  })

  describe('createInquiry', () => {
    it('問い合わせを新規作成し、作成されたinquiryIdを返す', async () => {
      mockedClient.post.mockResolvedValue({ data: { inquiryId: 10 } })

      const result = await inquiryApi.createInquiry({
        category: INQUIRY_CATEGORY.GENERAL,
        title: 'テストタイトル',
        body: '問い合わせ内容',
      })

      expect(mockedClient.post).toHaveBeenCalledWith('/api/inquiries', {
        category: INQUIRY_CATEGORY.GENERAL,
        title: 'テストタイトル',
        body: '問い合わせ内容',
      })
      expect(result).toEqual({ inquiryId: 10 })
    })

    it('別のカテゴリ（SHOPPING）でも正常に送信できる', async () => {
      mockedClient.post.mockResolvedValue({ data: { inquiryId: 20 } })

      await inquiryApi.createInquiry({
        category: INQUIRY_CATEGORY.SHOPPING,
        title: '買い物について',
        body: '内容',
      })

      expect(mockedClient.post).toHaveBeenCalledWith('/api/inquiries', {
        category: INQUIRY_CATEGORY.SHOPPING,
        title: '買い物について',
        body: '内容',
      })
    })
  })

  describe('addMessage', () => {
    it('指定のinquiryIdにメッセージを送信する', async () => {
      mockedClient.post.mockResolvedValue({ data: {} })

      await inquiryApi.addMessage(5, 'メッセージ内容')

      expect(mockedClient.post).toHaveBeenCalledWith('/api/inquiries/5/messages', {
        body: 'メッセージ内容',
      })
    })
  })

  describe('closeInquiry', () => {
    it('指定のinquiryIdをクローズする', async () => {
      mockedClient.post.mockResolvedValue({ data: {} })

      await inquiryApi.closeInquiry(7)

      expect(mockedClient.post).toHaveBeenCalledWith('/api/inquiries/7/close')
    })
  })

  describe('escalateToStaff', () => {
    it('指定のinquiryIdをスタッフへエスカレーションする', async () => {
      mockedClient.post.mockResolvedValue({ data: {} })

      await inquiryApi.escalateToStaff(3)

      expect(mockedClient.post).toHaveBeenCalledWith('/api/inquiries/3/escalate')
    })
  })
})
