import { describe, it, expect } from 'vitest'
import { toApiErrorMessageKey } from '@/utils/apiErrorMessage'
import type { ApiError } from '@/api/client'

describe('apiErrorMessage', () => {
  describe('toApiErrorMessageKey', () => {
    it('ApiErrorの形状でない場合は errors.unexpected を返す', () => {
      expect(toApiErrorMessageKey(null)).toBe('errors.unexpected')
      expect(toApiErrorMessageKey(undefined)).toBe('errors.unexpected')
      expect(toApiErrorMessageKey('string error')).toBe('errors.unexpected')
      expect(toApiErrorMessageKey({})).toBe('errors.unexpected')
      expect(toApiErrorMessageKey({ errorCode: 123 })).toBe('errors.unexpected') // errorCode is not string
    })

    // --- Auth / Signup ---
    it('EMAIL_ALREADY_USED -> signup.errors.emailUsed', () => {
      const err: Partial<ApiError> = { errorCode: 'EMAIL_ALREADY_USED' }
      expect(toApiErrorMessageKey(err)).toBe('signup.errors.emailUsed')
    })

    it('EMAIL_NOT_VERIFIED -> login.errors.emailNotVerified', () => {
      const err: Partial<ApiError> = { errorCode: 'EMAIL_NOT_VERIFIED' }
      expect(toApiErrorMessageKey(err)).toBe('login.errors.emailNotVerified')
    })

    // --- Email verification ---
    it('EMAIL_VERIFICATION_TOKEN_INVALID -> emailVerify.errors.tokenInvalid', () => {
      const err: Partial<ApiError> = { errorCode: 'EMAIL_VERIFICATION_TOKEN_INVALID' }
      expect(toApiErrorMessageKey(err)).toBe('emailVerify.errors.tokenInvalid')
    })

    it('EMAIL_VERIFICATION_COOLDOWN -> emailVerify.errors.cooldown', () => {
      const err: Partial<ApiError> = { errorCode: 'EMAIL_VERIFICATION_COOLDOWN' }
      expect(toApiErrorMessageKey(err)).toBe('emailVerify.errors.cooldown')
    })

    it('EMAIL_VERIFICATION_TOO_MANY_REQUESTS -> emailVerify.errors.tooManyRequests', () => {
      const err: Partial<ApiError> = { errorCode: 'EMAIL_VERIFICATION_TOO_MANY_REQUESTS' }
      expect(toApiErrorMessageKey(err)).toBe('emailVerify.errors.tooManyRequests')
    })

    // --- 共通 ---
    it('UNAUTHORIZED -> errors.unauthorized', () => {
      const err: Partial<ApiError> = { errorCode: 'UNAUTHORIZED' }
      expect(toApiErrorMessageKey(err)).toBe('errors.unauthorized')
    })

    it('FORBIDDEN -> errors.forbidden', () => {
      const err: Partial<ApiError> = { errorCode: 'FORBIDDEN' }
      expect(toApiErrorMessageKey(err)).toBe('errors.forbidden')
    })

    it('VALIDATION_ERROR -> errors.validation', () => {
      const err: Partial<ApiError> = { errorCode: 'VALIDATION_ERROR' }
      expect(toApiErrorMessageKey(err)).toBe('errors.validation')
    })

    describe('UNKNOWN / default fallback', () => {
      it('UNKNOWN かつ status=0 -> errors.network', () => {
        const err: Partial<ApiError> = { errorCode: 'UNKNOWN', status: 0 }
        expect(toApiErrorMessageKey(err)).toBe('errors.network')
      })

      it('UNKNOWN かつ status=undefined -> errors.network', () => {
        const err: Partial<ApiError> = { errorCode: 'UNKNOWN', status: undefined }
        expect(toApiErrorMessageKey(err)).toBe('errors.network')
      })

      it('UNKNOWN かつ status>=500 -> errors.server', () => {
        expect(toApiErrorMessageKey({ errorCode: 'UNKNOWN', status: 500 })).toBe('errors.server')
        expect(toApiErrorMessageKey({ errorCode: 'UNKNOWN', status: 503 })).toBe('errors.server')
      })

      it('UNKNOWN かつ それ以外 -> errors.unexpected', () => {
        expect(toApiErrorMessageKey({ errorCode: 'UNKNOWN', status: 400 })).toBe('errors.unexpected')
        expect(toApiErrorMessageKey({ errorCode: 'UNKNOWN', status: 404 })).toBe('errors.unexpected')
      })

      it('未定義のerrorCode -> fallbackロジックに従う', () => {
        // status 0 -> network
        expect(toApiErrorMessageKey({ errorCode: 'SOMETHING_ELSE', status: 0 })).toBe(
          'errors.network',
        )
        // status 500 -> server
        expect(toApiErrorMessageKey({ errorCode: 'SOMETHING_ELSE', status: 500 })).toBe(
          'errors.server',
        )
        // others -> unexpected
        expect(toApiErrorMessageKey({ errorCode: 'SOMETHING_ELSE', status: 418 })).toBe(
          'errors.unexpected',
        )
      })
    })
  })
})
