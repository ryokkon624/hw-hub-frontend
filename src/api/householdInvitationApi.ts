import { apiClient } from '@/api/client'
import type { HouseholdInvitationViewModel, HouseholdInvitationModel } from '@/domain'
import type { InvitationStatusCode } from '@/constants/code.constants'

export const householdInvitationApi = {
  /**
   * 指定された世帯の招待情報を取得する。
   * @param householdId 世帯ID
   * @returns 招待Domain Model配列
   */
  async listByHousehold(householdId: number): Promise<HouseholdInvitationModel[]> {
    const res = await apiClient.get<HouseholdInvitationDto[]>(
      `/api/households/${householdId}/invitations`,
    )
    return res.data.map(toInvitationModel)
  },

  /**
   * 招待する。
   * @param householdId 世帯ID
   * @param invitedEmail 招待する人のメールアドレス
   * @returns 招待Domain Model
   */
  async create(householdId: number, invitedEmail: string): Promise<HouseholdInvitationModel> {
    const res = await apiClient.post<HouseholdInvitationDto>(
      `/api/households/${householdId}/invitations`,
      { invitedEmail },
    )
    return toInvitationModel(res.data)
  },

  /**
   * 招待情報を取得する。（招待を受けた側がアクセスする情報）
   * @param token トークン
   * @returns 招待リンク画面用のDomain Model
   */
  async getInvitation(token: string): Promise<HouseholdInvitationViewModel> {
    const res = await apiClient.get<HouseholdInvitationView>(`/api/household-invitations/${token}`)
    return toInvitationViewModel(res.data)
  },

  /**
   * 招待を承諾する。
   * @param token トークン
   */
  async accept(token: string): Promise<void> {
    await apiClient.post<void>(`/api/household-invitations/${token}/accept`, {})
  },

  /**
   * 招待を辞退する。
   * @param token トークン
   */
  async decline(token: string): Promise<void> {
    await apiClient.post<void>(`/api/household-invitations/${token}/decline`, {})
  },

  /**
   * 招待を取り消す。
   * @param token トークン
   */
  async revoke(token: string): Promise<void> {
    await apiClient.post<void>(`/api/household-invitations/${token}/revoke`, {})
  },
}

// ---- API DTO ----------------------------------------------------

/**
 * Response用のDTO
 */
type HouseholdInvitationView = {
  householdId: number
  householdName: string
  inviterDisplayName: string
  invitedEmail: string
  status: string
  expired: boolean
}

/**
 * Response用のDTO
 */
type HouseholdInvitationDto = {
  householdId: number
  inviterUserId: number
  invitedEmail: string
  invitationToken: string
  status: string
  expiresAt: string
  acceptedUserId: number | null
  acceptedUserName: string | null
  createdAt: string
}

// ---- Mapper: DTO ⇔ Domain ----------------------------------------------------

/**
 * Response DTO → Domain Modelへの変換
 * @param dto Response DTO
 * @returns Domain Model
 */
const toInvitationViewModel = (dto: HouseholdInvitationView): HouseholdInvitationViewModel => ({
  householdId: dto.householdId,
  householdName: dto.householdName,
  inviterDisplayName: dto.inviterDisplayName,
  invitedEmail: dto.invitedEmail,
  status: dto.status as InvitationStatusCode,
  expired: dto.expired,
})

/**
 * Response DTO → Domain Modelへの変換
 * @param dto Response DTO
 * @returns Domain Model
 */
const toInvitationModel = (dto: HouseholdInvitationDto): HouseholdInvitationModel => ({
  householdId: dto.householdId,
  inviterUserId: dto.inviterUserId,
  invitedEmail: dto.invitedEmail,
  invitationToken: dto.invitationToken,
  status: dto.status as InvitationStatusCode,
  expiresAt: dto.expiresAt,
  acceptedUserId: dto.acceptedUserId,
  acceptedUserName: dto.acceptedUserName,
  createdAt: dto.createdAt,
})
