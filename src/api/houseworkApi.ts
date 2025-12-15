import { apiClient } from './client'
import type { Housework, HouseworkSaveInput } from '@/domain/'
import type { RecurrenceTypeCode, CategoryCode } from '@/constants/code.constants'

export const houseworkApi = {
  /**
   * 指定された世帯の家事を取得する。
   * @param householdId 世帯ID
   * @returns 家事Domain Model配列
   */
  async fetchHouseworks(householdId: number): Promise<Housework[]> {
    const res = await apiClient.get<HouseworkDto[]>('/api/houseworks', {
      params: { householdId },
    })
    const dtos = res.data
    return dtos.map(toHousework)
  },

  /**
   * 指定された家事を1件取得する。
   * @param houseworkId 家事ID
   * @returns 家事Domain Model
   */
  async getHousework(houseworkId: number): Promise<Housework> {
    const res = await apiClient.get<HouseworkDto>(`/api/houseworks/${houseworkId}`)
    return toHousework(res.data)
  },

  /**
   * 家事を登録する。
   * @param householdId 世帯ID
   * @param input 入力値
   * @returns 家事Domain Model
   */
  async createHousework(householdId: number, input: HouseworkSaveInput): Promise<Housework> {
    const payload = toHouseworkSaveRequestDto(householdId, input)
    const res = await apiClient.post<HouseworkDto>('/api/houseworks', payload)
    return toHousework(res.data)
  },

  /**
   * 家事を更新する。
   * @param householdId 世帯ID
   * @param houseworkId 家事ID
   * @param payload 入力値
   * @returns 家事Domain Model
   */
  async updateHousework(
    householdId: number,
    houseworkId: number,
    input: HouseworkSaveInput,
  ): Promise<Housework> {
    const payload = toHouseworkSaveRequestDto(householdId, input)
    const res = await apiClient.put<HouseworkDto>(`/api/houseworks/${houseworkId}`, payload)
    return toHousework(res.data)
  },

  /**
   * 家事を削除する。
   * @param houseworkId 家事ID
   */
  async deleteHousework(houseworkId: number): Promise<void> {
    await apiClient.delete(`/api/houseworks/${houseworkId}`)
  },
}

// ---- API DTO ----------------------------------------------------

/**
 * Response用の家事のDTO
 */
interface HouseworkDto {
  houseworkId: number
  householdId: number
  name: string
  description: string | null
  category: string
  recurrenceType: string
  weeklyDays: number | null
  dayOfMonth: number | null
  nthWeek: number | null
  weekday: number | null
  startDate: string
  endDate: string
  defaultAssigneeUserId: number | null
}

/**
 * Request用の家事のDTO
 */
interface HouseworkSaveRequestDto {
  householdId: number
  name: string
  description: string | null
  category: string
  recurrenceType: string
  weeklyDays: number | null
  dayOfMonth: number | null
  nthWeek: number | null
  weekday: number | null
  startDate: string
  endDate: string
  defaultAssigneeUserId: number | null
}

// ---- Mapper: DTO ⇔ Domain ----------------------------------------------------

/**
 * Response DTO → Domain Modelへの変換
 * @param dto Response DTO
 * @returns Domain Model
 */
const toHousework = (dto: HouseworkDto): Housework => ({
  houseworkId: dto.houseworkId,
  householdId: dto.householdId,
  name: dto.name,
  description: dto.description,
  category: dto.category as CategoryCode,
  recurrenceType: dto.recurrenceType as RecurrenceTypeCode,
  weeklyDays: dto.weeklyDays,
  dayOfMonth: dto.dayOfMonth,
  nthWeek: dto.nthWeek,
  weekday: dto.weekday,
  startDate: dto.startDate ?? null,
  endDate: dto.endDate ?? null,
  defaultAssigneeUserId: dto.defaultAssigneeUserId,
})

/**
 * Domain Input + householdId → Request DTOへの変換
 * @param householdId 世帯ID
 * @param input Domain Input
 * @returns Request DTO
 */
const toHouseworkSaveRequestDto = (
  householdId: number,
  input: HouseworkSaveInput,
): HouseworkSaveRequestDto => ({
  householdId,
  name: input.name,
  description: input.description,
  category: input.category,
  recurrenceType: input.recurrenceType,
  weeklyDays: input.weeklyDays,
  dayOfMonth: input.dayOfMonth,
  nthWeek: input.nthWeek,
  weekday: input.weekday,
  startDate: input.startDate ?? '',
  endDate: input.endDate ?? '',
  defaultAssigneeUserId: input.defaultAssigneeUserId,
})
