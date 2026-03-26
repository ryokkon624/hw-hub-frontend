import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useInquiryCodes } from '@/composables/useInquiryCodes'
import { CODE_TYPE } from '@/constants/code.constants'

const mockLabelOf = vi.fn()
const mockOptionsOf = vi.fn()

vi.mock('@/composables/useCodes', () => ({
  useCodes: () => ({
    labelOf: mockLabelOf,
    optionsOf: mockOptionsOf,
  }),
}))

describe('useInquiryCodes', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockOptionsOf.mockReturnValue(ref([]))
  })

  describe('categoryLabel', () => {
    it('INQUIRY_CATEGORYタイプでlabelOfを呼ぶ', () => {
      mockLabelOf.mockReturnValue('バグ報告')
      const { categoryLabel } = useInquiryCodes()

      const result = categoryLabel('01')

      expect(mockLabelOf).toHaveBeenCalledWith(CODE_TYPE.INQUIRY_CATEGORY, '01')
      expect(result).toBe('バグ報告')
    })

    it('nullを渡した場合はlabelOfにそのまま渡す', () => {
      mockLabelOf.mockReturnValue('')
      const { categoryLabel } = useInquiryCodes()

      const result = categoryLabel(null)

      expect(mockLabelOf).toHaveBeenCalledWith(CODE_TYPE.INQUIRY_CATEGORY, null)
      expect(result).toBe('')
    })
  })

  describe('statusLabel', () => {
    it('INQUIRY_STATUSタイプでlabelOfを呼ぶ', () => {
      mockLabelOf.mockReturnValue('対応中')
      const { statusLabel } = useInquiryCodes()

      const result = statusLabel('02')

      expect(mockLabelOf).toHaveBeenCalledWith(CODE_TYPE.INQUIRY_STATUS, '02')
      expect(result).toBe('対応中')
    })

    it('undefinedを渡した場合はlabelOfにそのまま渡す', () => {
      mockLabelOf.mockReturnValue('')
      const { statusLabel } = useInquiryCodes()

      const result = statusLabel(undefined)

      expect(mockLabelOf).toHaveBeenCalledWith(CODE_TYPE.INQUIRY_STATUS, undefined)
      expect(result).toBe('')
    })
  })

  describe('senderTypeLabel', () => {
    it('INQUIRY_SENDER_TYPEタイプでlabelOfを呼ぶ', () => {
      mockLabelOf.mockReturnValue('ユーザー')
      const { senderTypeLabel } = useInquiryCodes()

      const result = senderTypeLabel('01')

      expect(mockLabelOf).toHaveBeenCalledWith(CODE_TYPE.INQUIRY_SENDER_TYPE, '01')
      expect(result).toBe('ユーザー')
    })
  })

  describe('categoryOptions', () => {
    it('INQUIRY_CATEGORYタイプでoptionsOfを呼ぶ', () => {
      const options = ref([
        { value: '01', label: 'バグ報告' },
        { value: '02', label: '機能要望' },
      ])
      mockOptionsOf.mockReturnValue(options)

      const { categoryOptions } = useInquiryCodes()

      expect(mockOptionsOf).toHaveBeenCalledWith(CODE_TYPE.INQUIRY_CATEGORY)
      expect(categoryOptions.value).toEqual([
        { value: '01', label: 'バグ報告' },
        { value: '02', label: '機能要望' },
      ])
    })
  })
})
