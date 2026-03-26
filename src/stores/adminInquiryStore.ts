import { defineStore } from 'pinia'
import { adminApi } from '@/api/adminApi'
import type { AdminInquiryModel, AdminInquirySearchParams, InquiryDetail } from '@/domain'

interface AdminInquiryState {
  pendingItems: AdminInquiryModel[]
  searchResults: AdminInquiryModel[]
  currentDetail: InquiryDetail | null
  isLoadingPending: boolean
  isSearching: boolean
  isLoadingDetail: boolean
  isSubmitting: boolean
  activeTab: 'pending' | 'search'
  lastSearchParams: AdminInquirySearchParams | null
}

export const useAdminInquiryStore = defineStore('adminInquiry', {
  state: (): AdminInquiryState => ({
    pendingItems: [],
    searchResults: [],
    currentDetail: null,
    isLoadingPending: false,
    isSearching: false,
    isLoadingDetail: false,
    isSubmitting: false,
    activeTab: 'pending',
    lastSearchParams: null,
  }),

  actions: {
    async loadPending(): Promise<void> {
      if (this.isLoadingPending) return
      this.isLoadingPending = true
      try {
        this.pendingItems = await adminApi.fetchPendingInquiries()
      } finally {
        this.isLoadingPending = false
      }
    },

    async search(params: AdminInquirySearchParams): Promise<void> {
      if (this.isSearching) return
      this.isSearching = true
      try {
        this.searchResults = await adminApi.searchInquiries(params)
      } finally {
        this.isSearching = false
      }
    },

    async loadDetail(inquiryId: number): Promise<void> {
      if (this.isLoadingDetail) return
      this.isLoadingDetail = true
      try {
        this.currentDetail = await adminApi.fetchAdminInquiryDetail(inquiryId)
      } finally {
        this.isLoadingDetail = false
      }
    },

    async reply(inquiryId: number, body: string): Promise<void> {
      if (this.isSubmitting) return
      this.isSubmitting = true
      try {
        await adminApi.replyToInquiry(inquiryId, body)
        // 返信後に対応待ちリストから除外（楽観的更新）
        this.pendingItems = this.pendingItems.filter((i) => i.inquiryId !== inquiryId)
        // 詳細を再取得してスレッドを更新
        this.isLoadingDetail = false
        await this.loadDetail(inquiryId)
      } finally {
        this.isSubmitting = false
      }
    },

    setActiveTab(tab: 'pending' | 'search') {
      this.activeTab = tab
    },

    saveSearchParams(params: AdminInquirySearchParams) {
      this.lastSearchParams = { ...params }
    },

    clear() {
      this.pendingItems = []
      this.searchResults = []
      this.currentDetail = null
      this.activeTab = 'pending'
      this.lastSearchParams = null
    },
  },
})
