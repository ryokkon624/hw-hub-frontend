import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, type Ref } from 'vue'
import type { CodeModel } from '@/domain/code/code.model'
import { useCodes } from '@/composables/useCodes'
import { resolveCodeLabel } from '@/utils/codeLabelResolver'

// --- codeStore のモック ---

type GetByTypeFn = (codeType: string) => CodeModel[]
type GetOneFn = (codeType: string, codeValue: string) => CodeModel | undefined

const getByTypeMock = vi.fn<GetByTypeFn>()
const getOneMock = vi.fn<GetOneFn>()

vi.mock('@/stores/codeStore', () => {
  const useCodeStore = () => ({
    getByType: getByTypeMock,
    getOne: getOneMock,
  })
  return { useCodeStore }
})

// --- vue-i18n のモック ---

const localeRef: Ref<string> = ref('ja')

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: localeRef,
  }),
}))

// --- resolveCodeLabel のモック（呼び出しを検証したい） ---

vi.mock('@/utils/codeLabelResolver', async (orig) => {
  const actual = (await orig()) as typeof import('@/utils/codeLabelResolver')
  return {
    ...actual,
    resolveCodeLabel: vi.fn(actual.resolveCodeLabel),
  }
})

const resolveCodeLabelMock = vi.mocked(resolveCodeLabel)

describe('useCodes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localeRef.value = 'ja'
  })

  it('codesOf: 指定タイプのコード一覧を computed で返す', () => {
    const codes: CodeModel[] = [
      {
        codeType: '0001',
        codeTypeName: '',
        codeTypeNameEn: '',
        codeValue: '1',
        name: '毎週',
        displayNameJa: '毎週',
        displayNameEn: 'Weekly',
        displayNameEs: 'Semanal',
        remarks: '',
        displayOrder: '1',
      },
    ]
    getByTypeMock.mockReturnValue(codes)

    const { codesOf } = useCodes()

    const result = codesOf('0001')

    // computedは.value を読むまで中の関数が実行されないため一度読む
    const value = result.value

    expect(getByTypeMock).toHaveBeenCalledWith('0001')
    expect(value).toEqual(codes)
  })

  it('labelOf: value が null/undefined のときは空文字を返し、store を呼ばない', () => {
    const { labelOf } = useCodes()

    expect(labelOf('0001', null)).toBe('')
    expect(labelOf('0001', undefined)).toBe('')
    expect(getOneMock).not.toHaveBeenCalled()
  })

  it('labelOf: コードが存在すれば resolveCodeLabel を locale 付きで呼ぶ', () => {
    const code: CodeModel = {
      codeType: '0001',
      codeTypeName: '',
      codeTypeNameEn: '',
      codeValue: '1',
      name: '毎週',
      displayNameJa: '毎週',
      displayNameEn: 'Weekly',
      displayNameEs: 'Semanal',
      remarks: '',
      displayOrder: '1',
    }
    getOneMock.mockReturnValue(code)
    resolveCodeLabelMock.mockReturnValue('毎週_JA')
    localeRef.value = 'ja'

    const { labelOf } = useCodes()
    const result = labelOf('0001', 1)

    expect(getOneMock).toHaveBeenCalledWith('0001', '1')
    expect(resolveCodeLabelMock).toHaveBeenCalledWith(code, 'ja')
    expect(result).toBe('毎週_JA')
  })

  it('labelOf: コードが存在しなければ空文字を返す', () => {
    getOneMock.mockReturnValue(undefined)

    const { labelOf } = useCodes()
    const result = labelOf('0001', 1)

    expect(result).toBe('')
  })

  it('optionsOf: コード一覧を { value, label } の配列に変換する', () => {
    const codes: CodeModel[] = [
      {
        codeType: '0001',
        codeTypeName: '',
        codeTypeNameEn: '',
        codeValue: '1',
        name: '毎週',
        displayNameJa: '毎週',
        displayNameEn: 'Weekly',
        displayNameEs: 'Semanal',
        remarks: '',
        displayOrder: '1',
      },
      {
        codeType: '0001',
        codeTypeName: '',
        codeTypeNameEn: '',
        codeValue: '2',
        name: '毎月',
        displayNameJa: '毎月',
        displayNameEn: 'Monthly',
        displayNameEs: 'Mensual',
        remarks: '',
        displayOrder: '2',
      },
    ]
    getByTypeMock.mockReturnValue(codes)
    resolveCodeLabelMock
      .mockImplementationOnce(() => '毎週_JA')
      .mockImplementationOnce(() => '毎月_JA')

    const { optionsOf } = useCodes()
    const options = optionsOf('0001')

    // computedは.value を読むまで中の関数が実行されないため一度読む
    const value = options.value

    expect(getByTypeMock).toHaveBeenCalledWith('0001')
    expect(resolveCodeLabelMock).toHaveBeenNthCalledWith(1, codes[0], 'ja')
    expect(resolveCodeLabelMock).toHaveBeenNthCalledWith(2, codes[1], 'ja')
    expect(value).toEqual([
      { value: '1', label: '毎週_JA' },
      { value: '2', label: '毎月_JA' },
    ])
  })
})
