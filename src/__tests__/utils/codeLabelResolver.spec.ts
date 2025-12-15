import { describe, it, expect } from 'vitest'
import { resolveCodeLabel } from '@/utils/codeLabelResolver'
import type { CodeModel } from '@/domain/code/code.model'

const baseCode: CodeModel = {
  codeType: '0001',
  codeTypeName: 'dummy',
  codeTypeNameEn: 'dummy',
  codeValue: '1',
  name: 'BASE',
  displayNameJa: null,
  displayNameEn: null,
  displayNameEs: null,
  remarks: null,
  displayOrder: null,
}

describe('resolveCodeLabel', () => {
  it('locale=ja のとき displayNameJa があればそれを返す、なければ name を返す', () => {
    const codeWithJa: CodeModel = {
      ...baseCode,
      displayNameJa: '日本語名',
    }
    expect(resolveCodeLabel(codeWithJa, 'ja')).toBe('日本語名')

    const codeWithoutJa: CodeModel = {
      ...baseCode,
      displayNameJa: null,
    }
    expect(resolveCodeLabel(codeWithoutJa, 'ja')).toBe('BASE')
  })

  it('locale=en のとき displayNameEn があればそれを返す、なければ name を返す', () => {
    const codeWithEn: CodeModel = {
      ...baseCode,
      displayNameEn: 'English',
    }
    expect(resolveCodeLabel(codeWithEn, 'en')).toBe('English')

    const codeWithoutEn: CodeModel = {
      ...baseCode,
      displayNameEn: null,
    }
    expect(resolveCodeLabel(codeWithoutEn, 'en')).toBe('BASE')
  })

  it('locale=es のとき displayNameEs > displayNameEn > name の優先順位で返す', () => {
    const codeWithEs: CodeModel = {
      ...baseCode,
      displayNameEs: 'Español',
      displayNameEn: 'English',
    }
    expect(resolveCodeLabel(codeWithEs, 'es')).toBe('Español')

    const codeWithoutEs: CodeModel = {
      ...baseCode,
      displayNameEs: null,
      displayNameEn: 'English',
    }
    expect(resolveCodeLabel(codeWithoutEs, 'es')).toBe('English')

    const codeNoEsNoEn: CodeModel = {
      ...baseCode,
      displayNameEs: null,
      displayNameEn: null,
    }
    expect(resolveCodeLabel(codeNoEsNoEn, 'es')).toBe('BASE')
  })

  it('未知の locale の場合は name を返す', () => {
    const code: CodeModel = {
      ...baseCode,
      name: 'BASE_NAME',
      displayNameJa: '日本語',
      displayNameEn: 'English',
      displayNameEs: 'Español',
    }
    expect(resolveCodeLabel(code, 'fr')).toBe('BASE_NAME')
  })
})
