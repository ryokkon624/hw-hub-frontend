import type { ApiError } from '@/api/client'

/**
 * ApiError を i18n の message key に変換する。
 *
 * - 画面共通で使う「デフォルト変換」
 * - 画面固有で出し分けたい場合は、呼び出し側で上書きしてOK
 */
export const toApiErrorMessageKey = (err: unknown): string => {
  const e = err as Partial<ApiError>

  // ApiError ですらない（network error / 予期しない例外など）
  if (!e || typeof e !== 'object' || typeof e.errorCode !== 'string') {
    return 'errors.unexpected'
  }

  // errorCode 優先で分岐
  switch (e.errorCode) {
    // --- Auth / Signup ---
    case 'EMAIL_ALREADY_USED':
      return 'signup.errors.emailUsed'

    case 'EMAIL_NOT_VERIFIED':
      return 'login.errors.emailNotVerified'

    // --- Email verification ---
    case 'EMAIL_VERIFICATION_TOKEN_INVALID':
      return 'emailVerify.errors.tokenInvalid'

    case 'EMAIL_VERIFICATION_COOLDOWN':
      return 'emailVerify.errors.cooldown'

    case 'EMAIL_VERIFICATION_TOO_MANY_REQUESTS':
      return 'emailVerify.errors.tooManyRequests'

    // --- 共通 ---
    case 'UNAUTHORIZED':
      return 'errors.unauthorized'

    case 'FORBIDDEN':
      return 'errors.forbidden'

    case 'VALIDATION_ERROR':
      return 'errors.validation'

    case 'UNKNOWN':
    default:
      // ステータスでフォールバック
      if (e.status === 0 || e.status === undefined) return 'errors.network'
      if (e.status >= 500) return 'errors.server'

      return 'errors.unexpected'
  }
}
