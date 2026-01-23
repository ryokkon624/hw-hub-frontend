import { describe, it, expect } from 'vitest'
import { toUiError } from '@/domain/error/errorMapper'
import type { ApiError } from '@/api/client'

describe('errorMapper', () => {
  it('statusなし(ネットワークエラー)の場合 errors.common.network を返す', () => {
    const err = { message: 'Network Error' }
    const result = toUiError(err)
    expect(result.messageKey).toBe('errors.common.network')
  })

  it('既知の errorCode がある場合は辞書から対応するキーを返す', () => {
    const err: Partial<ApiError> = {
      status: 400,
      errorCode: 'PASSWORD_TOO_WEAK',
    }
    const result = toUiError(err)
    expect(result.messageKey).toBe('errors.passwordChange.tooWeak')
  })

  it('errorCode が UNKNOWN の場合は status から推測する (401)', () => {
    const err: Partial<ApiError> = {
      status: 401,
      errorCode: 'UNKNOWN',
    }
    const result = toUiError(err)
    // 辞書のキー 'UNAUTHORIZED' -> 'errors.common.unauthorized'
    expect(result.messageKey).toBe('errors.common.unauthorized')
  })

  // normalizeCode の網羅
  it('normalizeCode: 400 -> BAD_REQUEST', () => {
    const result = toUiError({ status: 400, errorCode: 'UNKNOWN' })
    expect(result.messageKey).toBe('errors.common.badRequest')
  })
  it('normalizeCode: 403 -> FORBIDDEN', () => {
    const result = toUiError({ status: 403, errorCode: 'UNKNOWN' })
    expect(result.messageKey).toBe('errors.common.forbidden')
  })
  it('normalizeCode: 404 -> NOT_FOUND', () => {
    const result = toUiError({ status: 404, errorCode: 'UNKNOWN' })
    expect(result.messageKey).toBe('errors.common.notFound')
  })
  it('normalizeCode: 409 -> CONFLICT', () => {
    const result = toUiError({ status: 409, errorCode: 'UNKNOWN' })
    expect(result.messageKey).toBe('errors.common.conflict')
  })
  it('normalizeCode: 429 -> TOO_MANY_REQUESTS', () => {
    const result = toUiError({ status: 429, errorCode: 'UNKNOWN' })
    expect(result.messageKey).toBe('errors.common.tooManyRequests')
  })

  // fallbackKeyByStatus の網羅 (normalizeCode で UNKNOWN になった後、マップにキーがない場合に呼ばれる)
  // ただし、現在は normalizeCode で返した文字列がすべて ERROR_CODE_TO_I18N_KEY に存在するため、
  // fallbackKeyByStatus が呼ばれるルートを通すには、normalizeCode が 'UNKNOWN' を返すが、fallbackKeyByStatus がヒットするケースが必要だが、
  // normalizeCode の default: UNKNOWN 以外はすべて辞書にある。
  // 辞書にないコードが来た場合のフォールバックをテストする。

  it('未知の errorCode が来て、辞書にないが status がある場合のフォールバック (400)', () => {
    const err: Partial<ApiError> = { status: 400, errorCode: 'WEIRD_ERROR' }
    // ERROR_CODE_TO_I18N_KEY['WEIRD_ERROR'] は undefined
    // -> fallbackKeyByStatus(400) -> 'errors.common.badRequest'
    expect(toUiError(err).messageKey).toBe('errors.common.badRequest')
  })
  it('未知の errorCode (401)', () => {
    expect(toUiError({ status: 401, errorCode: 'X' }).messageKey).toBe('errors.common.unauthorized')
  })
  it('未知の errorCode (403)', () => {
    expect(toUiError({ status: 403, errorCode: 'X' }).messageKey).toBe('errors.common.forbidden')
  })
  it('未知の errorCode (404)', () => {
    expect(toUiError({ status: 404, errorCode: 'X' }).messageKey).toBe('errors.common.notFound')
  })
  it('未知の errorCode (409)', () => {
    expect(toUiError({ status: 409, errorCode: 'X' }).messageKey).toBe('errors.common.conflict')
  })
  it('未知の errorCode (429)', () => {
    expect(toUiError({ status: 429, errorCode: 'X' }).messageKey).toBe('errors.common.tooManyRequests')
  })

  it('errorCode が無く、statusがマップ外の場合 (例: 502) は errors.common.failed', () => {
    const err: Partial<ApiError> = {
      status: 502,
    }
    const result = toUiError(err)
    // 502 >= 500 -> INTERNAL_SERVER_ERROR -> errors.common.failed
    expect(result.messageKey).toBe('errors.common.failed')
  })

  it('errorCode が無く、statusが418 (I am a teapot) の場合は errors.common.failed (default)', () => {
    // 418はスイッチにない -> fallbackKeyByStatus(418) -> null -> 'errors.common.failed'
    const err: Partial<ApiError> = {
      status: 418,
    }
    const result = toUiError(err)
    expect(result.messageKey).toBe('errors.common.failed')
  })

  it('最近追加された PASSWORD_RESET系コードのテスト', () => {
    const err: Partial<ApiError> = {
      status: 403,
      errorCode: 'PASSWORD_RESET_DISABLED',
    }
    expect(toUiError(err).messageKey).toBe('errors.passwordReset.disabled')

    const err2: Partial<ApiError> = {
      status: 400,
      errorCode: 'PASSWORD_RESET_TOKEN_INVALID',
    }
    expect(toUiError(err2).messageKey).toBe('errors.passwordReset.invalid')
  })
})
