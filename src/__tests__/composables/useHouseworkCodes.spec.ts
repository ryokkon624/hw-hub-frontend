import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useHouseworkCodes } from '@/composables/useHouseworkCodes'
import { CODE_TYPE } from '@/constants/code.constants'

type LabelOfFn = (type: string, value: string | number | null | undefined) => string
type OptionsOfFn = (type: string) => unknown

const labelOfMock = vi.fn<LabelOfFn>()
const optionsOfMock = vi.fn<OptionsOfFn>()

vi.mock('@/composables/useCodes', () => ({
  useCodes: () => ({
    labelOf: labelOfMock,
    optionsOf: optionsOfMock,
  }),
}))

describe('useHouseworkCodes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('各 *Label 関数は適切な CODE_TYPE を labelOf に渡す', () => {
    labelOfMock.mockReturnValue('LABEL')

    const { recurrenceTypeLabel, categoryLabel, weekdayLabel, nthWeekLabel } = useHouseworkCodes()

    recurrenceTypeLabel('1')
    categoryLabel('CAT')
    weekdayLabel('2')
    nthWeekLabel('3')

    expect(labelOfMock).toHaveBeenNthCalledWith(1, CODE_TYPE.RECURRENCE_TYPE, '1')
    expect(labelOfMock).toHaveBeenNthCalledWith(2, CODE_TYPE.CATEGORY, 'CAT')
    expect(labelOfMock).toHaveBeenNthCalledWith(3, CODE_TYPE.WEEKDAY, '2')
    expect(labelOfMock).toHaveBeenNthCalledWith(4, CODE_TYPE.NTH_WEEK, '3')
  })

  it('各 *Options は適切な CODE_TYPE を optionsOf に渡した結果をそのまま返す', () => {
    // 呼ばれた codeType をそのまま持ったオブジェクトを返す実装にする
    optionsOfMock.mockImplementation((type) => ({ type }))

    const { recurrenceTypeOptions, categoryOptions, weekdayOptions, nthWeekOptions } =
      useHouseworkCodes()

    expect(optionsOfMock).toHaveBeenNthCalledWith(1, CODE_TYPE.RECURRENCE_TYPE)
    expect(optionsOfMock).toHaveBeenNthCalledWith(2, CODE_TYPE.CATEGORY)
    expect(optionsOfMock).toHaveBeenNthCalledWith(3, CODE_TYPE.WEEKDAY)
    expect(optionsOfMock).toHaveBeenNthCalledWith(4, CODE_TYPE.NTH_WEEK)

    expect(recurrenceTypeOptions).toEqual({ type: CODE_TYPE.RECURRENCE_TYPE })
    expect(categoryOptions).toEqual({ type: CODE_TYPE.CATEGORY })
    expect(weekdayOptions).toEqual({ type: CODE_TYPE.WEEKDAY })
    expect(nthWeekOptions).toEqual({ type: CODE_TYPE.NTH_WEEK })
  })
})
