import type { ApiError } from '@/api/client'
import type { UiError } from '@/domain'

/**
 * ApiError を UI 表示向けの UiError に変換する。
 *
 * 方針：
 * - errorCode を UI の i18n key に変換する
 * - errorCode が無い/UNKNOWN の場合は status から推定する
 * - 未定義は errors.common.failed に落とす
 * - ネットワーク系（statusなし）も errors.common.network に落とす
 */
export const toUiError = (err: unknown): UiError => {
  const e = err as Partial<ApiError>

  // ネットワークやCORSなど、HTTPレスポンスに到達していないケース
  if (e.status == null) {
    return { messageKey: 'errors.common.network' }
  }

  const status = e.status
  const rawCode = e.errorCode

  // errorCode が無い or UNKNOWN の場合は status から推定して UI を安定させる
  const code = normalizeCode(rawCode, status)

  // 共通マップ（ここが全画面の辞書）
  const key = ERROR_CODE_TO_I18N_KEY[code] ?? fallbackKeyByStatus(status) ?? 'errors.common.failed'

  return { messageKey: key }
}

/**
 * errorCode が無い/UNKNOWN の場合に、HTTP status から擬似コードに正規化する。
 * - これにより backend 側の例外が未整備でも UI が破綻しにくい
 */
const normalizeCode = (code: string | undefined, status: number): string => {
  if (code && code !== 'UNKNOWN') return code

  switch (status) {
    case 400:
      return 'BAD_REQUEST'
    case 401:
      return 'UNAUTHORIZED'
    case 403:
      return 'FORBIDDEN'
    case 404:
      return 'NOT_FOUND'
    case 409:
      return 'CONFLICT'
    case 429:
      return 'TOO_MANY_REQUESTS'
    default:
      // 5xx は INTERNAL_SERVER_ERROR に寄せる
      if (status >= 500) return 'INTERNAL_SERVER_ERROR'
      return 'UNKNOWN'
  }
}

/**
 * status からの最終フォールバック（errorCode map に無い場合でも最低限の文言に落とす）
 */
const fallbackKeyByStatus = (status: number): string | null => {
  switch (status) {
    case 400:
      return 'errors.common.badRequest'
    case 401:
      return 'errors.common.unauthorized'
    case 403:
      return 'errors.common.forbidden'
    case 404:
      return 'errors.common.notFound'
    case 409:
      return 'errors.common.conflict'
    case 429:
      return 'errors.common.tooManyRequests'
    default:
      if (status >= 500) return 'errors.common.failed'
      return null
  }
}

/**
 * errorCode → i18n key の変換テーブル
 * - ここに追加していれば、ページ側は分岐不要
 */
const ERROR_CODE_TO_I18N_KEY: Record<string, string> = {
  // ---- Auth / Signup ----
  EMAIL_ALREADY_USED: 'errors.auth.emailAlreadyUsed',
  EMAIL_ALREADY_VERIFIED: 'errors.emailVerify.alreadyVerified',
  EMAIL_NOT_VERIFIED: 'errors.auth.emailNotVerified',

  // ---- Email Verification ----
  EMAIL_VERIFICATION_TOKEN_INVALID: 'errors.emailVerify.invalid',
  EMAIL_VERIFICATION_COOLDOWN: 'errors.emailVerify.cooldown',
  EMAIL_VERIFICATION_LIMIT_EXCEEDED: 'errors.emailVerify.limitExceeded',

  // ---- Password Reset ----
  PASSWORD_RESET_DISABLED: 'errors.passwordReset.disabled',
  PASSWORD_RESET_TOKEN_INVALID: 'errors.passwordReset.invalid',
  PASSWORD_RESET_TOKEN_EXPIRED: 'errors.passwordReset.expired',
  PASSWORD_RESET_COOLDOWN: 'errors.passwordReset.cooldown',
  PASSWORD_RESET_LIMIT_EXCEEDED: 'errors.passwordReset.limitExceeded',

  // ---- Password Change (Logged-in) ----
  CURRENT_PASSWORD_INVALID: 'errors.passwordChange.currentPasswordInvalid',
  PASSWORD_SAME_AS_OLD: 'errors.passwordChange.sameAsOld',
  PASSWORD_TOO_WEAK: 'errors.passwordChange.tooWeak',

  // ---- Common (by code) ----
  VALIDATION_ERROR: 'errors.common.validation',
  BAD_REQUEST: 'errors.common.badRequest',
  UNAUTHORIZED: 'errors.common.unauthorized',
  FORBIDDEN: 'errors.common.forbidden',
  NOT_FOUND: 'errors.common.notFound',
  CONFLICT: 'errors.common.conflict',
  TOO_MANY_REQUESTS: 'errors.common.tooManyRequests',
  INTERNAL_SERVER_ERROR: 'errors.common.failed',
  UNKNOWN: 'errors.common.failed',
}
