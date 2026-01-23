import { apiClient } from './client'

/**
 * Password Reset API
 *
 * - パスワードを忘れた場合のリセット要求／確定を扱う。
 * - どちらも成功時は 204（レスポンスボディなし）。
 */
export const passwordResetApi = {
  /**
   * パスワードリセットのメール送信を要求する。
   *
   * 仕様：
   * - 情報漏えい対策のため、メールが存在しない場合でも 204 が返る（＝成功扱い）。
   */
  async request(payload: { email: string }): Promise<void> {
    await apiClient.post<void>('/api/auth/password-reset/request', payload)
  },

  /**
   * パスワードリセットを確定する。
   *
   * token はURLクエリで受け取ったものを渡す。
   */
  async confirm(payload: { token: string; newPassword: string }): Promise<void> {
    await apiClient.post<void>('/api/auth/password-reset/confirm', payload)
  },
}
