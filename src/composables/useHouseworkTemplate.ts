import { useI18n } from 'vue-i18n'
import type { HouseworkTemplateModel } from '@/domain'

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function useHouseworkTemplate() {
  const { locale } = useI18n()

  const getLocalizedName = (t: HouseworkTemplateModel): string => {
    const key = `name${capitalize(locale.value)}` as keyof HouseworkTemplateModel
    return (t[key] as string) || t.nameJa
  }

  const getLocalizedDescription = (t: HouseworkTemplateModel): string | null => {
    const key = `description${capitalize(locale.value)}` as keyof HouseworkTemplateModel
    return (t[key] as string | null) ?? null
  }

  const getLocalizedRecommendation = (t: HouseworkTemplateModel): string | null => {
    const key = `recommendation${capitalize(locale.value)}` as keyof HouseworkTemplateModel
    return (t[key] as string | null) ?? null
  }

  return { getLocalizedName, getLocalizedDescription, getLocalizedRecommendation }
}
