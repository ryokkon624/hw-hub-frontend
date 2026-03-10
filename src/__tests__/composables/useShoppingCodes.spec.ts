// src/__tests__/composables/useShoppingCodes.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { computed, type ComputedRef } from 'vue'
import { CODE_TYPE } from '@/constants/code.constants'

// ★ 本物の useCodes を使わせないためのモック
const labelOfMock = vi.fn<(type: string, value: string | number | null | undefined) => string>()
const optionsOfMock = vi.fn<(type: string) => ComputedRef<{ value: string; label: string }[]>>()

vi.mock('@/composables/useCodes', () => ({
  useCodes: () => ({
    labelOf: labelOfMock,
    optionsOf: optionsOfMock,
  }),
}))

// ★ モック定義のあとで対象を import（Vitest がよしなにやってくれる）
import { useShoppingCodes } from '@/composables/useShoppingCodes'

describe('useShoppingCodes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('storeTypeLabel: 購入場所コードのラベルを返す', () => {
    labelOfMock.mockReturnValue('スーパー')

    const { storeTypeLabel } = useShoppingCodes()
    const result = storeTypeLabel('01')

    expect(labelOfMock).toHaveBeenCalledWith(CODE_TYPE.PURCHASE_LOCATION_TYPE, '01')
    expect(result).toBe('スーパー')
  })

  it('shoppingItemStatusLabel: 買い物アイテムステータスのラベルを返す', () => {
    labelOfMock.mockReturnValue('未購入')

    const { shoppingItemStatusLabel } = useShoppingCodes()
    const result = shoppingItemStatusLabel('1')

    expect(labelOfMock).toHaveBeenCalledWith(CODE_TYPE.SHOPPING_ITEM_STATUS, '1')
    expect(result).toBe('未購入')
  })

  it('storeTypeOptions: 購入場所タイプの options を返す (computed)', () => {
    const expected = [
      { value: '01', label: 'スーパー' },
      { value: '02', label: 'ドラッグストア' },
    ]

    // optionsOf は「computed を返す」モックにする
    optionsOfMock.mockReturnValue(computed(() => expected))

    const { storeTypeOptions } = useShoppingCodes()
    const result = storeTypeOptions.value

    expect(optionsOfMock).toHaveBeenCalledWith(CODE_TYPE.PURCHASE_LOCATION_TYPE)
    expect(result).toEqual(expected)
  })

  describe('storeTypeBorderClass', () => {
    it('1の場合は border-hwhub-store-super を返す', () => {
      const { storeTypeBorderClass } = useShoppingCodes()
      expect(storeTypeBorderClass('1')).toBe('border-hwhub-store-super')
    })

    it('2の場合は border-hwhub-store-online を返す', () => {
      const { storeTypeBorderClass } = useShoppingCodes()
      expect(storeTypeBorderClass('2')).toBe('border-hwhub-store-online')
    })

    it('3の場合は border-hwhub-store-drug を返す', () => {
      const { storeTypeBorderClass } = useShoppingCodes()
      expect(storeTypeBorderClass('3')).toBe('border-hwhub-store-drug')
    })

    it('それ以外(不正値、null、undefined)の場合は border-gray-300 を返す', () => {
      const { storeTypeBorderClass } = useShoppingCodes()
      expect(storeTypeBorderClass('99')).toBe('border-gray-300')
      expect(storeTypeBorderClass(null)).toBe('border-gray-300')
      expect(storeTypeBorderClass(undefined)).toBe('border-gray-300')
    })
  })

  describe('storeTypeDotClass', () => {
    it('1の場合は bg-hwhub-store-super を返す', () => {
      const { storeTypeDotClass } = useShoppingCodes()
      expect(storeTypeDotClass('1')).toBe('bg-hwhub-store-super')
    })

    it('2の場合は bg-hwhub-store-online を返す', () => {
      const { storeTypeDotClass } = useShoppingCodes()
      expect(storeTypeDotClass('2')).toBe('bg-hwhub-store-online')
    })

    it('3の場合は bg-hwhub-store-drug を返す', () => {
      const { storeTypeDotClass } = useShoppingCodes()
      expect(storeTypeDotClass('3')).toBe('bg-hwhub-store-drug')
    })

    it('それ以外(不正値、null、undefined)の場合は bg-gray-300 を返す', () => {
      const { storeTypeDotClass } = useShoppingCodes()
      expect(storeTypeDotClass('99')).toBe('bg-gray-300')
      expect(storeTypeDotClass(null)).toBe('bg-gray-300')
      expect(storeTypeDotClass(undefined)).toBe('bg-gray-300')
    })
  })
})
