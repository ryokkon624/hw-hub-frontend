import { useCodes } from './useCodes'
import { CODE_TYPE } from '@/constants/code.constants'

export function useHouseholdCodes() {
  const { labelOf } = useCodes()

  const memberStatusLabel = (v: string | number | null | undefined) =>
    labelOf(CODE_TYPE.HOUSEHOLD_MEMBER_STATUS, v)
  const invitationStatusLabel = (v: string | number | null | undefined) =>
    labelOf(CODE_TYPE.INVITATION_STATUS, v)

  return {
    memberStatusLabel,
    invitationStatusLabel,
  }
}
