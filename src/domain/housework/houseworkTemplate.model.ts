export interface HouseworkTemplateModel {
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
