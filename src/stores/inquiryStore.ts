import { defineStore } from 'pinia'
import { inquiryApi } from '@/api/inquiryApi'
import type { InquirySummary, InquiryDetail, InquiryCreateInput } from '@/domain'
import { INQUIRY_STATUS } from '@/constants/code.constants'

interface InquiryState {
  summaries: InquirySummary[]
  currentDetail: InquiryDetail | null
  isLoading: boolean
  isSubmitting: boolean
}

export const useInquiryStore = defineStore('inquiry', {
  state: (): InquiryState => ({
    summaries: [],
    currentDetail: null,
    isLoading: false,
    isSubmitting: false,
  }),

  actions: {
    /**
     * 問い合わせ一覧取得（TTLなし・常に最新を取得）
     */
    async loadAll(): Promise<void> {
      this.isLoading = true
      try {
        this.summaries = await inquiryApi.fetchInquiries()
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 問い合わせ詳細取得
     * @param inquiryId 問い合わせID
     */
    async loadDetail(inquiryId: number): Promise<void> {
      this.isLoading = true
      try {
        this.currentDetail = await inquiryApi.fetchInquiry(inquiryId)
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 新規問い合わせ送信
     * 成功後は loadAll で一覧を再取得する
     * @param input 入力値
     * @returns 作成した inquiryId
     */
    async create(input: InquiryCreateInput): Promise<number> {
      if (this.isSubmitting) return Promise.reject(new Error('送信中です'))
      this.isSubmitting = true
      try {
        const { inquiryId } = await inquiryApi.createInquiry(input)
        await this.loadAll()
        return inquiryId
      } finally {
        this.isSubmitting = false
      }
    },

    /**
     * 追加メッセージ送信
     * 送信後に loadDetail で詳細を再取得してメッセージ一覧を最新化する
     * @param inquiryId 問い合わせID
     * @param body メッセージ本文
     */
    async addMessage(inquiryId: number, body: string): Promise<void> {
      if (this.isSubmitting) return
      this.isSubmitting = true
      try {
        await inquiryApi.addMessage(inquiryId, body)
        await this.loadDetail(inquiryId)
      } finally {
        this.isSubmitting = false
      }
    },

    /**
     * 解決済みにする
     * 成功後に currentDetail の status を CLOSED に更新する
     * @param inquiryId 問い合わせID
     */
    async closeInquiry(inquiryId: number): Promise<void> {
      if (this.isSubmitting) return
      this.isSubmitting = true
      try {
        await inquiryApi.closeInquiry(inquiryId)
        if (this.currentDetail?.inquiryId === inquiryId) {
          this.currentDetail = { ...this.currentDetail, status: INQUIRY_STATUS.CLOSED }
        }
      } finally {
        this.isSubmitting = false
      }
    },

    /**
     * スタッフ対応依頼
     * 成功後に currentDetail の status を PENDING_STAFF に更新する
     * @param inquiryId 問い合わせID
     */
    async escalateToStaff(inquiryId: number): Promise<void> {
      if (this.isSubmitting) return
      this.isSubmitting = true
      try {
        await inquiryApi.escalateToStaff(inquiryId)
        if (this.currentDetail?.inquiryId === inquiryId) {
          this.currentDetail = { ...this.currentDetail, status: INQUIRY_STATUS.PENDING_STAFF }
        }
      } finally {
        this.isSubmitting = false
      }
    },

    /**
     * ストアをリセットする
     */
    clear(): void {
      this.summaries = []
      this.currentDetail = null
      this.isLoading = false
      this.isSubmitting = false
    },
  },
})
