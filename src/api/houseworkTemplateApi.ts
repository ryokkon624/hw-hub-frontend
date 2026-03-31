import { apiClient } from './client'
import type { HouseworkTemplateModel } from '@/domain'

// ---- API クライアント --------------------------------------------
export const houseworkTemplateApi = {
  async fetchAll(): Promise<HouseworkTemplateModel[]> {
    const res = await apiClient.get<HouseworkTemplateDto[]>('/api/housework-templates')
    return res.data.map(toHouseworkTemplate)
  },
}

// ---- Response DTO ------------------------------------------------
interface HouseworkTemplateDto {
  houseworkTemplateId: number
  nameJa: string
  nameEn: string
  nameEs: string
  descriptionJa: string | null
  descriptionEn: string | null
  descriptionEs: string | null
  recommendationJa: string | null
  recommendationEn: string | null
  recommendationEs: string | null
  category: string
  recurrenceType: string
  weeklyDays: number | null
  dayOfMonth: number | null
  nthWeek: number | null
  weekday: number | null
}

// ---- Mapper: DTO → Domain ----------------------------------------------------
const toHouseworkTemplate = (dto: HouseworkTemplateDto): HouseworkTemplateModel => ({
  houseworkTemplateId: dto.houseworkTemplateId,
  nameJa: dto.nameJa,
  nameEn: dto.nameEn,
  nameEs: dto.nameEs,
  descriptionJa: dto.descriptionJa,
  descriptionEn: dto.descriptionEn,
  descriptionEs: dto.descriptionEs,
  recommendationJa: dto.recommendationJa,
  recommendationEn: dto.recommendationEn,
  recommendationEs: dto.recommendationEs,
  category: dto.category,
  recurrenceType: dto.recurrenceType,
  weeklyDays: dto.weeklyDays,
  dayOfMonth: dto.dayOfMonth,
  nthWeek: dto.nthWeek,
  weekday: dto.weekday,
})
