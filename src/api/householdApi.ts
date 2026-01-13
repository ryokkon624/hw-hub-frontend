import { apiClient } from './client'
import type { HouseholdModel, HouseholdMember } from '@/domain'
import type { HouseholdMemberStatusCode } from '@/constants/code.constants'

export const householdApi = {
  /**
   * 指定された世帯IDのメンバーを取得する。
   * @param householdId 世帯ID
   * @returns 家事メンバーDomain Model配列
   */
  async getHouseholdMembers(householdId: number): Promise<HouseholdMember[]> {
    const res = await apiClient.get<HouseholdMemberDto[]>(`/api/households/${householdId}/members`)
    return res.data.map(toHouseholdMemberModel)
  },

  /**
   * 世帯名を更新する。
   * @param householdId 世帯ID
   * @param name 世帯名
   */
  async updateHouseholdName(householdId: number, name: string): Promise<void> {
    await apiClient.put(`/api/households/${householdId}`, {
      name,
    })
  },

  /**
   * 世帯を登録する。
   * @param payload 入力値
   * @returns
   */
  async createHousehold(name: string): Promise<HouseholdModel> {
    const res = await apiClient.post<CreateHouseholdResponseDto>('/api/households', {
      name,
    } satisfies CreateHouseholdRequestDto)

    return toHouseholdModel(res.data)
  },

  /**
   * 世帯を削除する。
   * @param householdId 世帯ID
   */
  async deleteHousehold(householdId: number): Promise<void> {
    await apiClient.delete(`/api/households/${householdId}`)
  },
}

// ---- API DTO ----------------------------------------------------

interface CreateHouseholdRequestDto {
  name: string
}

interface CreateHouseholdResponseDto {
  householdId: number
  name: string
  ownerUserId: number
}

interface HouseholdMemberDto {
  householdId: number
  userId: number
  displayName: string
  iconUrl: string | null
  nickname: string | null
  status: string
  role: string
}

// ---- Mapper: DTO ⇔ Domain ----------------------------------------------------

/**
 * Response DTO → Domain Modelへの変換
 * @param dto Response DTO
 * @returns Domain Model
 */
const toHouseholdModel = (dto: CreateHouseholdResponseDto): HouseholdModel => ({
  householdId: dto.householdId,
  name: dto.name,
  ownerUserId: dto.ownerUserId,
})

/**
 * Response DTO → Domain Modelへの変換
 * @param dto Response DTO
 * @returns Domain Model
 */
const toHouseholdMemberModel = (dto: HouseholdMemberDto): HouseholdMember => ({
  householdId: dto.householdId,
  userId: dto.userId,
  displayName: dto.displayName,
  iconUrl: dto.iconUrl,
  nickname: dto.nickname,
  status: dto.status as HouseholdMemberStatusCode,
  role: dto.role,
})
