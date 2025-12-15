import { describe, it, expect } from 'vitest'
import { isErrorResponse, type ErrorResponse } from '@/domain/error'

describe('isErrorResponse', () => {
  it('errorCode と message が string のオブジェクトなら true を返す', () => {
    const data: ErrorResponse = {
      errorCode: 'E001',
      message: 'Something went wrong',
    }

    expect(isErrorResponse(data)).toBe(true)
  })

  it('details があっても正しい構造なら true を返す', () => {
    const data: ErrorResponse = {
      errorCode: 'E002',
      message: 'Validation error',
      details: [
        { field: 'name', message: '必須です' },
        { field: 'email', message: '形式が不正です' },
      ],
    }

    expect(isErrorResponse(data)).toBe(true)
  })

  it('errorCode が string でない場合は false を返す', () => {
    const data = {
      errorCode: 123,
      message: 'msg',
    }

    expect(isErrorResponse(data)).toBe(false)
  })

  it('message が string でない場合は false を返す', () => {
    const data = {
      errorCode: 'E003',
      message: 999,
    }

    expect(isErrorResponse(data)).toBe(false)
  })

  it('errorCode だけの場合は false を返す', () => {
    const data = {
      errorCode: 'E004',
    }

    expect(isErrorResponse(data)).toBe(false)
  })

  it('message だけの場合は false を返す', () => {
    const data = {
      message: 'only message',
    }

    expect(isErrorResponse(data)).toBe(false)
  })

  it('空オブジェクトは false を返す', () => {
    expect(isErrorResponse({})).toBe(false)
  })

  it('null / undefined / プリミティブ値は false を返す', () => {
    expect(isErrorResponse(null)).toBe(false)
    expect(isErrorResponse(undefined)).toBe(false)
    expect(isErrorResponse('string')).toBe(false)
    expect(isErrorResponse(123)).toBe(false)
    expect(isErrorResponse(true)).toBe(false)
  })
})
