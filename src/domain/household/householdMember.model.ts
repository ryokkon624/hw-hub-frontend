import type { HouseholdMemberStatusCode } from '@/constants/code.constants'

export interface HouseholdMember {
  householdId: number
  userId: number
  displayName: string
  iconUrl: string | null
  nickname: string | null
  status: HouseholdMemberStatusCode
  role: string
}
