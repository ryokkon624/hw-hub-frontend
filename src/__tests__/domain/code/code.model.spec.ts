import { describe, it, expect } from 'vitest'
import { resolveCodeLabel, type CodeModel } from '@/domain/code/code.model'

const base: CodeModel = {
  codeType: '0001',
  codeTypeName: null,
  codeTypeNameEn: null,
  codeValue: '1',
  name: 'BASE',
  displayNameJa: null,
  displayNameEn: null,
  displayNameEs: null,
  remarks: null,
  displayOrder: null,
}

describe('resolveCodeLabel (domain)', () => {
  it('ja: displayNameJa があればそれ、なければ name', () => {
    expect(resolveCodeLabel({ ...base, displayNameJa: '日本語' }, 'ja')).toBe('日本語')
    expect(resolveCodeLabel(base, 'ja')).toBe('BASE')
  })

  it('es: displayNameEs → displayNameEn → name の順', () => {
    expect(resolveCodeLabel({ ...base, displayNameEs: 'スペイン語' }, 'es')).toBe('スペイン語')
    expect(resolveCodeLabel({ ...base, displayNameEn: '英語' }, 'es')).toBe('英語')
    expect(resolveCodeLabel(base, 'es')).toBe('BASE')
  })

  it('en: displayNameEn → name の順', () => {
    expect(resolveCodeLabel({ ...base, displayNameEn: 'English' }, 'en')).toBe('English')
    expect(resolveCodeLabel(base, 'en')).toBe('BASE')
  })

  it('その他の locale も en と同じ扱い', () => {
    expect(resolveCodeLabel({ ...base, displayNameEn: 'English' }, 'fr')).toBe('English')
    expect(resolveCodeLabel(base, 'fr')).toBe('BASE')
  })
})
