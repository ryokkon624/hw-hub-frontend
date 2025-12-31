import { defineStore } from 'pinia'
import type { AuthSession, LoginUser } from '@/domain'
import { authApi } from '@/api/authApi'
import { userApi } from '@/api/userApi'
import { useHouseholdStore } from '@/stores/householdStore'
import { useCodeStore } from '@/stores/codeStore'

interface AuthState {
  accessToken: string | null
  currentUser: LoginUser | null
  isUploadingIcon: boolean
}

const STORAGE_KEY = 'hwhub.auth'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: null,
    currentUser: null,
    isUploadingIcon: false,
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
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      try {
        const parsed = JSON.parse(raw) as AuthSession
        this.accessToken = parsed.accessToken
        this.currentUser = parsed.user

        const householdStore = useHouseholdStore()
        householdStore.initFromStorage()
      } catch {
        localStorage.removeItem(STORAGE_KEY)
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
      const session = await authApi.register(payload)
      this.accessToken = session.accessToken
      this.currentUser = session.user
      this.saveToStorage()

      const householdStore = useHouseholdStore()
      await householdStore.fetchMyHouseholds()

      const codeStore = useCodeStore()
      codeStore.loadAllIfNeeded()
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
    },

    /**
     * ユーザ情報を取得する。
     */
    async fetchUserProfile(): Promise<void> {
      const profile = await userApi.getProfile()
      this.currentUser = {
        userId: profile.userId,
        email: profile.email,
        displayName: profile.displayName,
        locale: profile.locale,
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
  },
})
