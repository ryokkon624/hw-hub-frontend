import { defineStore } from 'pinia'
import type { AuthSession, LoginUser } from '@/domain'
import { authApi } from '@/api/authApi'
import { userApi } from '@/api/userApi'
import { useHouseholdStore } from '@/stores/householdStore'
import { useCodeStore } from '@/stores/codeStore'
import { HOUSEHOLD_MEMBER_STATUS } from '@/constants/code.constants'
import { nextTick } from 'vue'
import { useNotificationStore } from './notificationStore'
import { useRoleStore } from './roleStore'

interface AuthState {
  accessToken: string | null
  currentUser: LoginUser | null
  isUploadingIcon: boolean
  isChangingPassword: boolean
  isStartingGoogleLink: boolean
  isBootstrapping: boolean // accessTokenが揺れている時はtrue。アカウントの連携時など
  isAuthTransition: boolean // OAuth token差し替え中のガード用
}

const STORAGE_KEY = 'hwhub.auth'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: null,
    currentUser: null,
    isUploadingIcon: false,
    isChangingPassword: false,
    isStartingGoogleLink: false,
    isBootstrapping: false,
    isAuthTransition: false,
  }),

  getters: {
    /**
     * 認証済みであるかを返す。
     * @param state
     * @returns 認証済みの場合true。
     */
    isAuthenticated: (state): boolean => !!state.accessToken,
  },

  actions: {
    /**
     * ローカルストレージにセッション情報を登録する。
     */
    saveToStorage() {
      const payload: AuthSession = {
        accessToken: this.accessToken ?? '',
        user: this.currentUser as LoginUser,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    },

    /**
     * ローカルストレージからセッション情報を復元する。
     * @returns
     */
    initFromStorage() {
      this.isBootstrapping = true
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const parsed = JSON.parse(raw) as AuthSession
        this.accessToken = parsed.accessToken
        this.currentUser = parsed.user

        const householdStore = useHouseholdStore()
        householdStore.initFromStorage()
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      } finally {
        this.isBootstrapping = false
      }
    },

    /**
     * ログイン処理を行う。
     * @param email メールアドレス
     * @param password パスワード入力値
     */
    async login(email: string, password: string) {
      const session = await authApi.login({ email, password })
      this.accessToken = session.accessToken
      this.currentUser = session.user
      this.saveToStorage()

      const householdStore = useHouseholdStore()
      await householdStore.fetchMyHouseholds()

      const codeStore = useCodeStore()
      codeStore.loadAllIfNeeded()

      const roleStore = useRoleStore()
      await roleStore.fetchMyRoles()
    },

    beginAuthTransition() {
      this.isAuthTransition = true
    },
    endAuthTransition() {
      this.isAuthTransition = false
    },

    /**
     * アカウント登録を行う。
     * @param payload 入力値
     */
    async register(payload: {
      email: string
      password: string
      displayName: string
      locale: string
      invitationToken?: string | null
    }) {
      const result = await authApi.register(payload)

      if (result.kind === 'VERIFICATION_REQUIRED') {
        // セッション保存はしない（未ログイン扱い）
        return result
      }

      // LOGGED_IN の場合のみセッション保存
      this.accessToken = result.session.accessToken
      this.currentUser = result.session.user
      this.saveToStorage()

      const householdStore = useHouseholdStore()
      await householdStore.fetchMyHouseholds()

      const codeStore = useCodeStore()
      codeStore.loadAllIfNeeded()

      const roleStore = useRoleStore()
      await roleStore.fetchMyRoles()

      return result
    },

    async verifyEmail(token: string): Promise<void> {
      await authApi.verifyEmail({ token })
    },

    async resendVerification(email: string): Promise<void> {
      await authApi.resendVerification({ email })
    },

    async startGoogleLogin() {
      const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
      window.location.assign(`${apiBase}/oauth/google/start`)
    },

    async completeOAuthLogin(accessToken: string) {
      this.isBootstrapping = true
      try {
        this.accessToken = accessToken
        this.saveToStorage()

        await nextTick()

        await this.fetchUserProfile()

        const householdStore = useHouseholdStore()
        await householdStore.fetchMyHouseholds()

        const codeStore = useCodeStore()
        codeStore.loadAllIfNeeded()
        const roleStore = useRoleStore()
        await roleStore.fetchMyRoles()
      } finally {
        this.isBootstrapping = false
        const notificationStore = useNotificationStore()
        notificationStore.refreshUnreadCount()
      }
    },

    async startGoogleLink() {
      const url = await authApi.getGoogleLinkStartUrl()
      window.location.assign(url)
    },

    /**
     * ログアウトする。
     */
    logout() {
      this.accessToken = null
      this.currentUser = null
      localStorage.removeItem(STORAGE_KEY)

      const householdStore = useHouseholdStore()
      householdStore.reset()

      const roleStore = useRoleStore()
      roleStore.clear()
    },

    /**
     * ユーザ情報を取得する。
     */
    async fetchUserProfile(): Promise<void> {
      const profile = await userApi.getProfile()
      this.currentUser = {
        userId: profile.userId,
        email: profile.email,
        authProvider: profile.authProvider,
        displayName: profile.displayName,
        locale: profile.locale,
        notificationEnabled: profile.notificationEnabled,
        iconUrl: profile.iconUrl,
      }
      this.saveToStorage()
    },

    /**
     * ユーザ情報を更新する。
     * @param payload 入力値
     */
    async updateAccountProfile(payload: { displayName: string; locale: string }): Promise<void> {
      await userApi.updateProfile(payload)

      if (!this.currentUser) return
      this.currentUser = {
        ...this.currentUser,
        displayName: payload.displayName,
        locale: payload.locale,
      }

      this.saveToStorage()
    },

    /**
     * 自分のパスワードを変更する。
     * - 変更後の「ログアウトして再ログイン」は画面側で実施
     */
    async changeMyPassword(payload: { currentPassword: string; newPassword: string }) {
      try {
        this.isChangingPassword = true
        await userApi.changeMyPassword({
          currentPassword: payload.currentPassword,
          newPassword: payload.newPassword,
        })
      } finally {
        this.isChangingPassword = false
      }
    },

    /**
     * 退会可能かどうかチェックする。
     * 自分がOWNERの世帯で、他にもメンバーがいる場合はエラーを投げる。
     */
    async validateAccountDeletion() {
      const householdStore = useHouseholdStore()
      // ストアの世帯一覧を使用（ログイン時に取得済み）
      const households = householdStore.households
      if (!households) return

      const myId = this.currentUser?.userId
      if (!myId) return

      for (const h of households) {
        if (h.ownerUserId === myId) {
          // メンバ一覧を取得（キャッシュがあればAPI呼ばれない）
          await householdStore.fetchMembers(h.householdId)
          const members = householdStore.membersByHouseholdId[h.householdId] || []

          // 有効なメンバーが自分以外にもいるか (status='1' が2人以上)
          const activeMembers = members.filter((m) => m.status === HOUSEHOLD_MEMBER_STATUS.ACTIVE)
          if (activeMembers.length > 1) {
            throw new Error('VALIDATION_ERROR_OWNER_WITH_MEMBERS')
          }
        }
      }
    },

    /**
     * ユーザのアイコンを更新する。
     * @param file uploadするファイル
     */
    async uploadUserIcon(file: File) {
      try {
        this.isUploadingIcon = true

        const { uploadUrl, fileKey } = await userApi.createIconUploadUrl({
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
        })

        await authApi.putToPresignedUrl(uploadUrl, file)

        await userApi.updateUserIcon({ fileKey })
        await this.fetchUserProfile()
      } finally {
        this.isUploadingIcon = false
      }
    },

    async updateNotificationEnabled(enabled: boolean) {
      const res = await userApi.updateNotificationSettings({ notificationEnabled: enabled })

      if (!this.currentUser) return
      this.currentUser = {
        ...this.currentUser,
        notificationEnabled: res.notificationEnabled ?? enabled,
      }

      if (!enabled) {
        const notificationStore = useNotificationStore()
        notificationStore.clear()
      }
    },

    /**
     * アカウントを退会する。
     */
    async deleteAccount() {
      await userApi.deleteAccount()
      this.logout()
    },

    patchCurrentUser(patch: Partial<{ notificationEnabled: boolean }>) {
      if (!this.currentUser) return
      this.currentUser = { ...this.currentUser, ...patch }
    },
  },
})
