import { defineStore } from 'pinia'
import { adminApi } from '@/api/adminApi'
import type { AdminUserModel } from '@/domain'
import type { UserRoleCode } from '@/constants/code.constants'

interface AdminRoleState {
  searchResults: AdminUserModel[]
  isSearching: boolean
  isSubmitting: boolean
}

export const useAdminRoleStore = defineStore('adminRole', {
  state: (): AdminRoleState => ({
    searchResults: [],
    isSearching: false,
    isSubmitting: false,
  }),

  actions: {
    /** メールアドレスでユーザー検索 */
    async searchUsers(email: string): Promise<void> {
      if (this.isSearching) return
      this.isSearching = true
      try {
        this.searchResults = await adminApi.searchUsers(email)
      } finally {
        this.isSearching = false
      }
    },

    /** ロール付与して検索結果を更新 */
    async assignRole(userId: number, role: UserRoleCode): Promise<void> {
      if (this.isSubmitting) return
      this.isSubmitting = true
      try {
        await adminApi.assignRole(userId, role)
        // State を楽観的に更新
        const user = this.searchResults.find((u) => u.userId === userId)
        if (user && !user.roles.includes(role)) {
          user.roles = [...user.roles, role]
        }
      } finally {
        this.isSubmitting = false
      }
    },

    /** ロール削除して検索結果を更新 */
    async removeRole(userId: number, role: UserRoleCode): Promise<void> {
      if (this.isSubmitting) return
      this.isSubmitting = true
      try {
        await adminApi.removeRole(userId, role)
        // State を楽観的に更新
        const user = this.searchResults.find((u) => u.userId === userId)
        if (user) {
          user.roles = user.roles.filter((r) => r !== role)
        }
      } finally {
        this.isSubmitting = false
      }
    },

    clear() {
      this.searchResults = []
      this.isSearching = false
      this.isSubmitting = false
    },
  },
})
