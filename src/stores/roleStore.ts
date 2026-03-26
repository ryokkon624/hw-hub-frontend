import { defineStore } from 'pinia'
import { roleApi } from '@/api/roleApi'
import type { UserRoleCode, PermissionCode } from '@/constants/code.constants'

interface RoleState {
  roles: UserRoleCode[]
  permissions: PermissionCode[]
  isLoading: boolean
}

export const useRoleStore = defineStore('role', {
  state: (): RoleState => ({
    roles: [],
    permissions: [],
    isLoading: false,
  }),

  getters: {
    /** 管理画面にアクセスできるか（いずれかのロールを持っていれば可） */
    hasAnyRole: (state) => state.roles.length > 0,
  },

  actions: {
    /**
     * ログインユーザーのロール・パーミッションを取得する。
     * authStore の login / register / completeOAuthLogin から呼ばれる。
     */
    async fetchMyRoles(): Promise<void> {
      if (this.isLoading) return
      this.isLoading = true
      try {
        const result = await roleApi.fetchMyRoles()
        this.roles = result.roles
        this.permissions = result.permissions
      } catch {
        // ロールなしユーザーは 200 + 空リストが返るので
        // エラーは握りつぶして空のまま維持
        this.roles = []
        this.permissions = []
      } finally {
        this.isLoading = false
      }
    },

    /** ログアウト時にリセット */
    clear() {
      this.roles = []
      this.permissions = []
      this.isLoading = false
    },
  },
})
