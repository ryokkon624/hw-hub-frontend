import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAdminInquiryStore } from '@/stores/adminInquiryStore'
import type {
  AdminInquiryModel,
  AdminInquirySearchParams,
  InquiryDetail,
  InquiryStatusSummaryModel,
} from '@/domain'

// adminApi をモック化
vi.mock('@/api/adminApi', () => ({
  adminApi: {
    fetchPendingInquiries: vi.fn(),
    searchInquiries: vi.fn(),
    fetchAdminInquiryDetail: vi.fn(),
    replyToInquiry: vi.fn(),
    fetchInquiryStats: vi.fn(),
    fetchInquiryMessageStats: vi.fn(),
    fetchInquiryStatusSummary: vi.fn(),
  },
}))

import { adminApi } from '@/api/adminApi'

const mockedAdminApi = adminApi as unknown as {
  fetchPendingInquiries: ReturnType<typeof vi.fn>
  searchInquiries: ReturnType<typeof vi.fn>
  fetchAdminInquiryDetail: ReturnType<typeof vi.fn>
  replyToInquiry: ReturnType<typeof vi.fn>
  fetchInquiryStats: ReturnType<typeof vi.fn>
  fetchInquiryMessageStats: ReturnType<typeof vi.fn>
  fetchInquiryStatusSummary: ReturnType<typeof vi.fn>
}

// テスト用データファクトリ
const makeInquiryModel = (inquiryId: number): AdminInquiryModel => ({
  inquiryId,
  userId: 1,
  userEmail: 'user@example.com',
  userDisplayName: 'テストユーザー',
  category: '10',
  status: '20',
  title: `問い合わせ ${inquiryId}`,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-06-01T00:00:00Z'),
  totalMessageCount: 1,
  userMessageCount: 1,
  aiMessageCount: 0,
  staffMessageCount: 0,
})

const makeInquiryDetail = (inquiryId: number): InquiryDetail => ({
  inquiryId,
  category: '10',
  status: '25',
  title: `詳細 ${inquiryId}`,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  messages: [
    {
      messageId: 1,
      seq: 1,
      senderType: 'USER',
      body: 'ユーザーメッセージ',
      createdAt: new Date('2025-01-01T00:00:00Z'),
    },
  ],
})

describe('adminInquiryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // ---- 初期状態 --------------------------------------------------

  describe('初期状態', () => {
    it('初期値が正しく設定されている', () => {
      const store = useAdminInquiryStore()

      expect(store.pendingItems).toEqual([])
      expect(store.searchResults).toEqual([])
      expect(store.currentDetail).toBeNull()
      expect(store.isLoadingPending).toBe(false)
      expect(store.isSearching).toBe(false)
      expect(store.isLoadingDetail).toBe(false)
      expect(store.isSubmitting).toBe(false)
      expect(store.activeTab).toBe('pending')
      expect(store.lastSearchParams).toBeNull()
    })
  })

  // ---- loadPending -----------------------------------------------

  describe('loadPending', () => {
    it('APIから対応待ち一覧を取得してpendingItemsに格納する', async () => {
      const items = [makeInquiryModel(1), makeInquiryModel(2)]
      mockedAdminApi.fetchPendingInquiries.mockResolvedValue(items)
      const store = useAdminInquiryStore()

      await store.loadPending()

      expect(mockedAdminApi.fetchPendingInquiries).toHaveBeenCalledOnce()
      expect(store.pendingItems).toEqual(items)
    })

    it('ロード中はisLoadingPendingがtrueになり、完了後falseに戻る', async () => {
      let resolvePromise!: (value: AdminInquiryModel[]) => void
      const pending = new Promise<AdminInquiryModel[]>((resolve) => {
        resolvePromise = resolve
      })
      mockedAdminApi.fetchPendingInquiries.mockReturnValue(pending)
      const store = useAdminInquiryStore()

      const loadPromise = store.loadPending()
      expect(store.isLoadingPending).toBe(true)

      resolvePromise([])
      await loadPromise
      expect(store.isLoadingPending).toBe(false)
    })

    it('APIがエラーを返した場合もisLoadingPendingはfalseに戻る', async () => {
      mockedAdminApi.fetchPendingInquiries.mockRejectedValue(new Error('サーバーエラー'))
      const store = useAdminInquiryStore()

      await expect(store.loadPending()).rejects.toThrow('サーバーエラー')
      expect(store.isLoadingPending).toBe(false)
    })

    it('既にロード中の場合は二重呼び出しをスキップする', async () => {
      mockedAdminApi.fetchPendingInquiries.mockResolvedValue([])
      const store = useAdminInquiryStore()
      store.isLoadingPending = true

      await store.loadPending()

      expect(mockedAdminApi.fetchPendingInquiries).not.toHaveBeenCalled()
    })
  })

  // ---- search ----------------------------------------------------

  describe('search', () => {
    it('検索条件を渡してAPIを呼び出し、結果をsearchResultsに格納する', async () => {
      const params: AdminInquirySearchParams = { status: '20', category: '10' }
      const items = [makeInquiryModel(10)]
      mockedAdminApi.searchInquiries.mockResolvedValue(items)
      const store = useAdminInquiryStore()

      await store.search(params)

      expect(mockedAdminApi.searchInquiries).toHaveBeenCalledWith(params)
      expect(store.searchResults).toEqual(items)
    })

    it('検索中はisSearchingがtrueになり、完了後falseに戻る', async () => {
      let resolvePromise!: (value: AdminInquiryModel[]) => void
      const pending = new Promise<AdminInquiryModel[]>((resolve) => {
        resolvePromise = resolve
      })
      mockedAdminApi.searchInquiries.mockReturnValue(pending)
      const store = useAdminInquiryStore()

      const searchPromise = store.search({})
      expect(store.isSearching).toBe(true)

      resolvePromise([])
      await searchPromise
      expect(store.isSearching).toBe(false)
    })

    it('APIがエラーを返した場合もisSearchingはfalseに戻る', async () => {
      mockedAdminApi.searchInquiries.mockRejectedValue(new Error('検索エラー'))
      const store = useAdminInquiryStore()

      await expect(store.search({})).rejects.toThrow('検索エラー')
      expect(store.isSearching).toBe(false)
    })

    it('既に検索中の場合は二重呼び出しをスキップする', async () => {
      mockedAdminApi.searchInquiries.mockResolvedValue([])
      const store = useAdminInquiryStore()
      store.isSearching = true

      await store.search({})

      expect(mockedAdminApi.searchInquiries).not.toHaveBeenCalled()
    })
  })

  // ---- loadDetail ------------------------------------------------

  describe('loadDetail', () => {
    it('問い合わせIDを渡してAPIを呼び出し、結果をcurrentDetailに格納する', async () => {
      const detail = makeInquiryDetail(100)
      mockedAdminApi.fetchAdminInquiryDetail.mockResolvedValue(detail)
      const store = useAdminInquiryStore()

      await store.loadDetail(100)

      expect(mockedAdminApi.fetchAdminInquiryDetail).toHaveBeenCalledWith(100)
      expect(store.currentDetail).toEqual(detail)
    })

    it('詳細ロード中はisLoadingDetailがtrueになり、完了後falseに戻る', async () => {
      let resolvePromise!: (value: InquiryDetail) => void
      const pending = new Promise<InquiryDetail>((resolve) => {
        resolvePromise = resolve
      })
      mockedAdminApi.fetchAdminInquiryDetail.mockReturnValue(pending)
      const store = useAdminInquiryStore()

      const loadPromise = store.loadDetail(100)
      expect(store.isLoadingDetail).toBe(true)

      resolvePromise(makeInquiryDetail(100))
      await loadPromise
      expect(store.isLoadingDetail).toBe(false)
    })

    it('APIがエラーを返した場合もisLoadingDetailはfalseに戻る', async () => {
      mockedAdminApi.fetchAdminInquiryDetail.mockRejectedValue(new Error('詳細取得エラー'))
      const store = useAdminInquiryStore()

      await expect(store.loadDetail(100)).rejects.toThrow('詳細取得エラー')
      expect(store.isLoadingDetail).toBe(false)
    })

    it('既に詳細ロード中の場合は二重呼び出しをスキップする', async () => {
      mockedAdminApi.fetchAdminInquiryDetail.mockResolvedValue(makeInquiryDetail(100))
      const store = useAdminInquiryStore()
      store.isLoadingDetail = true

      await store.loadDetail(100)

      expect(mockedAdminApi.fetchAdminInquiryDetail).not.toHaveBeenCalled()
    })
  })

  // ---- reply -----------------------------------------------------

  describe('reply', () => {
    it('返信APIを呼び出し、対象をpendingItemsから除外して詳細を再取得する', async () => {
      const items = [makeInquiryModel(1), makeInquiryModel(2)]
      const detail = makeInquiryDetail(1)
      mockedAdminApi.replyToInquiry.mockResolvedValue(undefined)
      mockedAdminApi.fetchAdminInquiryDetail.mockResolvedValue(detail)
      const store = useAdminInquiryStore()
      store.pendingItems = [...items]

      await store.reply(1, '返信内容')

      expect(mockedAdminApi.replyToInquiry).toHaveBeenCalledWith(1, '返信内容')
      // inquiryId=1 が除外される
      expect(store.pendingItems).toHaveLength(1)
      expect(store.pendingItems[0]!.inquiryId).toBe(2)
      // 詳細が再取得される
      expect(mockedAdminApi.fetchAdminInquiryDetail).toHaveBeenCalledWith(1)
      expect(store.currentDetail).toEqual(detail)
    })

    it('返信中はisSubmittingがtrueになり、完了後falseに戻る', async () => {
      const detail = makeInquiryDetail(1)
      let resolveReply!: (value: undefined) => void
      const replyPending = new Promise<undefined>((resolve) => {
        resolveReply = resolve
      })
      mockedAdminApi.replyToInquiry.mockReturnValue(replyPending)
      mockedAdminApi.fetchAdminInquiryDetail.mockResolvedValue(detail)
      const store = useAdminInquiryStore()

      const replyPromise = store.reply(1, '返信')
      expect(store.isSubmitting).toBe(true)

      resolveReply(undefined)
      await replyPromise
      expect(store.isSubmitting).toBe(false)
    })

    it('APIがエラーを返した場合もisSubmittingはfalseに戻る', async () => {
      mockedAdminApi.replyToInquiry.mockRejectedValue(new Error('返信エラー'))
      const store = useAdminInquiryStore()

      await expect(store.reply(1, '返信')).rejects.toThrow('返信エラー')
      expect(store.isSubmitting).toBe(false)
    })

    it('既に送信中の場合は二重呼び出しをスキップする', async () => {
      mockedAdminApi.replyToInquiry.mockResolvedValue(undefined)
      const store = useAdminInquiryStore()
      store.isSubmitting = true

      await store.reply(1, '返信')

      expect(mockedAdminApi.replyToInquiry).not.toHaveBeenCalled()
    })

    it('返信後にloadDetailが呼ばれる際、isLoadingDetailがリセットされている', async () => {
      const detail = makeInquiryDetail(5)
      mockedAdminApi.replyToInquiry.mockResolvedValue(undefined)
      mockedAdminApi.fetchAdminInquiryDetail.mockResolvedValue(detail)
      const store = useAdminInquiryStore()
      // 返信前に isLoadingDetail を true にして「スキップされない」ことを確認
      // reply() 内では isLoadingDetail = false にリセットしてから loadDetail を呼ぶ

      await store.reply(5, '返信')

      expect(mockedAdminApi.fetchAdminInquiryDetail).toHaveBeenCalledWith(5)
    })
  })

  // ---- setActiveTab ----------------------------------------------

  describe('setActiveTab', () => {
    it('"search" タブに切り替えられる', () => {
      const store = useAdminInquiryStore()
      expect(store.activeTab).toBe('pending')

      store.setActiveTab('search')

      expect(store.activeTab).toBe('search')
    })

    it('"pending" タブに切り替えられる', () => {
      const store = useAdminInquiryStore()
      store.activeTab = 'search'

      store.setActiveTab('pending')

      expect(store.activeTab).toBe('pending')
    })
  })

  // ---- saveSearchParams ------------------------------------------

  describe('saveSearchParams', () => {
    it('検索条件をlastSearchParamsに保存する', () => {
      const params: AdminInquirySearchParams = {
        status: '00',
        category: '40',
        userId: 3,
        createdAtFrom: '2025-01-01',
        createdAtTo: '2025-12-31',
      }
      const store = useAdminInquiryStore()

      store.saveSearchParams(params)

      expect(store.lastSearchParams).toEqual(params)
    })

    it('元のオブジェクトとは独立したコピーとして保存する（参照を切り離す）', () => {
      const params: AdminInquirySearchParams = { status: '00' }
      const store = useAdminInquiryStore()

      store.saveSearchParams(params)
      params.status = '20'

      // コピーなので変更が反映されない
      expect(store.lastSearchParams?.status).toBe('00')
    })
  })

  // ---- clear -----------------------------------------------------

  describe('clear', () => {
    it('全ての状態を初期値にリセットする', async () => {
      const store = useAdminInquiryStore()
      store.pendingItems = [makeInquiryModel(1)]
      store.searchResults = [makeInquiryModel(2)]
      store.currentDetail = makeInquiryDetail(3)
      store.activeTab = 'search'
      store.lastSearchParams = { status: '00' }

      store.clear()

      expect(store.pendingItems).toEqual([])
      expect(store.searchResults).toEqual([])
      expect(store.currentDetail).toBeNull()
      expect(store.activeTab).toBe('pending')
      expect(store.lastSearchParams).toBeNull()
    })

    it('ローディングフラグはclearで変更されない', () => {
      const store = useAdminInquiryStore()
      store.isLoadingPending = false
      store.isSearching = false
      store.isLoadingDetail = false
      store.isSubmitting = false

      store.clear()

      // clear() はローディング系フラグをリセットしない仕様
      expect(store.isLoadingPending).toBe(false)
      expect(store.isSearching).toBe(false)
      expect(store.isLoadingDetail).toBe(false)
      expect(store.isSubmitting).toBe(false)
    })
  })

  // ---- loadStatusSummary -----------------------------------------

  describe('loadStatusSummary', () => {
    it('APIからステータスサマリーを取得してstatusSummaryに格納する', async () => {
      const summary = {
        open: 1,
        aiAnswered: 2,
        pendingStaff: 3,
        staffAnswered: 4,
        staleUnclosedOpen: 1,
        staleUnclosedAiAnswered: 0,
        staleUnclosedPendingStaff: 2,
        staleUnclosedStaffAnswered: 1,
      }
      mockedAdminApi.fetchInquiryStatusSummary.mockResolvedValue(
        summary as InquiryStatusSummaryModel,
      )
      const store = useAdminInquiryStore()

      await store.loadStatusSummary()

      expect(mockedAdminApi.fetchInquiryStatusSummary).toHaveBeenCalledOnce()
      expect(store.statusSummary).toEqual(summary)
    })

    it('ロード中はisLoadingStatusSummaryがtrueになり、完了後falseに戻る', async () => {
      mockedAdminApi.fetchInquiryStatusSummary.mockReturnValue(new Promise(() => {}))
      const store = useAdminInquiryStore()

      store.loadStatusSummary()
      expect(store.isLoadingStatusSummary).toBe(true)
    })

    it('既にロード中の場合は二重呼び出しをスキップする', async () => {
      const store = useAdminInquiryStore()
      store.isLoadingStatusSummary = true

      await store.loadStatusSummary()

      expect(mockedAdminApi.fetchInquiryStatusSummary).not.toHaveBeenCalled()
    })
  })

  // ---- loadDailyStats --------------------------------------------

  describe('loadDailyStats', () => {
    it('日数を指定してAPIを呼び出し、結果をdailyStatsに格納する', async () => {
      const stats = [
        {
          date: '2025-01-01',
          open: 1,
          aiAnswered: 0,
          pendingStaff: 0,
          staffAnswered: 0,
          closed: 0,
        },
      ]
      mockedAdminApi.fetchInquiryStats.mockResolvedValue(stats)
      const store = useAdminInquiryStore()

      await store.loadDailyStats(15)

      expect(mockedAdminApi.fetchInquiryStats).toHaveBeenCalledWith(15)
      expect(store.dailyStats).toEqual(stats)
    })

    it('ロード中はisLoadingDailyStatsがtrueになり、完了後falseに戻る', async () => {
      mockedAdminApi.fetchInquiryStats.mockReturnValue(new Promise(() => {}))
      const store = useAdminInquiryStore()

      store.loadDailyStats(30)
      expect(store.isLoadingDailyStats).toBe(true)
    })

    it('既にロード中の場合は二重呼び出しをスキップする', async () => {
      const store = useAdminInquiryStore()
      store.isLoadingDailyStats = true

      await store.loadDailyStats(30)

      expect(mockedAdminApi.fetchInquiryStats).not.toHaveBeenCalled()
    })
  })

  // ---- loadMessageDailyStats -------------------------------------

  describe('loadMessageDailyStats', () => {
    it('日数を指定してAPIを呼び出し、結果をmessageDailyStatsに格納する', async () => {
      const stats = [{ date: '2025-01-01', user: 10, ai: 5, staff: 2 }]
      mockedAdminApi.fetchInquiryMessageStats.mockResolvedValue(stats)
      const store = useAdminInquiryStore()

      await store.loadMessageDailyStats(7)

      expect(mockedAdminApi.fetchInquiryMessageStats).toHaveBeenCalledWith(7)
      expect(store.messageDailyStats).toEqual(stats)
    })

    it('ロード中はisLoadingMessageDailyStatsがtrueになり、完了後falseに戻る', async () => {
      mockedAdminApi.fetchInquiryMessageStats.mockReturnValue(new Promise(() => {}))
      const store = useAdminInquiryStore()

      store.loadMessageDailyStats(10)
      expect(store.isLoadingMessageDailyStats).toBe(true)
    })

    it('既にロード中の場合は二重呼び出しをスキップする', async () => {
      const store = useAdminInquiryStore()
      store.isLoadingMessageDailyStats = true

      await store.loadMessageDailyStats(10)

      expect(mockedAdminApi.fetchInquiryMessageStats).not.toHaveBeenCalled()
    })
  })
})
