import { defineStore } from 'pinia'
import { passwordResetApi } from '@/api/passwordResetApi'
import type { ApiError } from '@/api/client'

interface PasswordResetState {
  isRequesting: boolean
  isConfirming: boolean

  /**
   * 直近でユーザが入力したメール（Sent画面で表示/再送に使う）
   * - ルーティングクエリに入れてもよいが、store に保持
   */
  lastEmail: string | null

  /**
   * 直近のエラーコード（UIはこれを見て表示を切り替える）
   */
  lastErrorCode: string | null
}

export const usePasswordResetStore = defineStore('passwordReset', {
  state: (): PasswordResetState => ({
    isRequesting: false,
    isConfirming: false,
    lastEmail: null,
    lastErrorCode: null,
  }),

  actions: {
    /**
     * エラー状態をクリアする（ページ遷移時などに呼ぶ）
     */
    clearError() {
      this.lastErrorCode = null
    },

    /**
     * リセットメールを要求する。
     *
     * - バックエンドが存在しないメールでも204を返す仕様なので、
     *   「成功扱い」でSent画面へ進める。
     */
    async request(email: string) {
      this.isRequesting = true
      this.lastErrorCode = null
      this.lastEmail = email

      try {
        await passwordResetApi.request({ email })
      } catch (e) {
        const err = e as ApiError
        this.lastErrorCode = err.errorCode ?? 'UNKNOWN'
        throw err
      } finally {
        this.isRequesting = false
      }
    },

    /**
     * リセットを確定する（token + newPassword）
     */
    async confirm(token: string, newPassword: string) {
      this.isConfirming = true
      this.lastErrorCode = null

      try {
        await passwordResetApi.confirm({ token, newPassword })
      } catch (e) {
        const err = e as ApiError
        this.lastErrorCode = err.errorCode ?? 'UNKNOWN'
        throw err
      } finally {
        this.isConfirming = false
      }
    },
  },
})
