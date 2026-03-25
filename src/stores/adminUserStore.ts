import { defineStore } from 'pinia'
import { adminApi } from '@/api/adminApi'
import type {
  AdminUserSearchParams,
  AdminCreateUserParams,
  AdminUpdateUserParams,
} from '@/api/adminApi'
import type { AdminUserDetailModel } from '@/domain'

interface AdminUserState {
  searchResults: AdminUserDetailModel[]
  isSearching: boolean
  isSubmitting: boolean
  lastSearchParams: AdminUserSearchParams
}

export const useAdminUserStore = defineStore('adminUser', {
  state: (): AdminUserState => ({
    searchResults: [],
    isSearching: false,
    isSubmitting: false,
    lastSearchParams: {},
  }),

  actions: {
    async search(params: AdminUserSearchParams): Promise<void> {
      if (this.isSearching) return
      this.isSearching = true
      this.lastSearchParams = { ...params }
      try {
        this.searchResults = await adminApi.searchAdminUsers(params)
      } finally {
        this.isSearching = false
      }
    },

    async createUser(params: AdminCreateUserParams): Promise<void> {
      if (this.isSubmitting) return
      this.isSubmitting = true
      try {
        const created = await adminApi.createAdminUser(params)
        this.searchResults = [created, ...this.searchResults]
      } finally {
        this.isSubmitting = false
      }
    },

    async updateUser(userId: number, params: AdminUpdateUserParams): Promise<void> {
      if (this.isSubmitting) return
      this.isSubmitting = true
      try {
        const updated = await adminApi.updateAdminUser(userId, params)
        const idx = this.searchResults.findIndex((u) => u.userId === userId)
        if (idx !== -1) this.searchResults[idx] = updated
      } finally {
        this.isSubmitting = false
      }
    },

    clear() {
      this.searchResults = []
      this.lastSearchParams = {}
    },
  },
})
