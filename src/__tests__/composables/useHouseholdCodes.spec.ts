import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useHouseholdCodes } from '@/composables/useHouseholdCodes'
import { CODE_TYPE } from '@/constants/code.constants'

type LabelOfFn = (type: string, value: string | number | null | undefined) => string

const labelOfMock = vi.fn<LabelOfFn>()

vi.mock('@/composables/useCodes', () => ({
  useCodes: () => ({
    labelOf: labelOfMock,
    optionsOf: vi.fn(), // この composable では使っていない
  }),
}))

describe('useHouseholdCodes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('memberStatusLabel は HOUSEHOLD_MEMBER_STATUS を渡して labelOf を呼ぶ', () => {
    labelOfMock.mockReturnValue('メンバーOK')

    const { memberStatusLabel } = useHouseholdCodes()
    const result = memberStatusLabel('1')

    expect(labelOfMock).toHaveBeenCalledWith(CODE_TYPE.HOUSEHOLD_MEMBER_STATUS, '1')
    expect(result).toBe('メンバーOK')
  })

  it('invitationStatusLabel は INVITATION_STATUS を渡して labelOf を呼ぶ', () => {
    labelOfMock.mockReturnValue('招待中')

    const { invitationStatusLabel } = useHouseholdCodes()
    const result = invitationStatusLabel('0')

    expect(labelOfMock).toHaveBeenCalledWith(CODE_TYPE.INVITATION_STATUS, '0')
    expect(result).toBe('招待中')
  })
})
