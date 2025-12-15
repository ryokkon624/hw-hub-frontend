import type { InvitationStatusCode } from '@/constants/code.constants'

/**
 * 招待リンク画面用のDomain Model
 */
export type HouseholdInvitationViewModel = {
  householdId: number
  householdName: string
  inviterDisplayName: string
  invitedEmail: string
  status: InvitationStatusCode
  expired: boolean
}

/**
 * 世帯画面の招待一覧用Domain Model
 */
export type HouseholdInvitationModel = {
  householdId: number
  inviterUserId: number
  invitedEmail: string
  invitationToken: string
  status: InvitationStatusCode
  expiresAt: string
  acceptedUserId: number | null
  acceptedUserName: string | null
  createdAt: string
}
