import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useHouseworkTemplate } from '@/composables/useHouseworkTemplate'
import { ref } from 'vue'

const locale = ref('ja')

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale,
  }),
}))

describe('useHouseworkTemplate', () => {
  beforeEach(() => {
    locale.value = 'ja'
    vi.clearAllMocks()
  })

  const mockTmpl = {
    houseworkTemplateId: 100,
    nameJa: '掃除',
    nameEn: 'Cleaning',
    nameEs: 'Limpieza',
    descriptionJa: '部屋の掃除',
    descriptionEn: 'Room cleaning',
    descriptionEs: 'Limpieza de la habitación',
    recommendationJa: '週に一度',
    recommendationEn: 'Once a week',
    recommendationEs: 'Una vez por semana',
    category: 'CLEAN',
    recurrenceType: 'WEEKLY',
    weeklyDays: 1,
    dayOfMonth: null,
    nthWeek: null,
    weekday: null,
  }

  it('getLocalizedName: 現在の言語に応じた名称を返す', () => {
    const { getLocalizedName } = useHouseworkTemplate()

    expect(getLocalizedName(mockTmpl)).toBe('掃除')

    locale.value = 'en'
    expect(getLocalizedName(mockTmpl)).toBe('Cleaning')

    locale.value = 'es'
    expect(getLocalizedName(mockTmpl)).toBe('Limpieza')
  })

  it('getLocalizedDescription: 現在の言語に応じた説明を返す', () => {
    const { getLocalizedDescription } = useHouseworkTemplate()

    expect(getLocalizedDescription(mockTmpl)).toBe('部屋の掃除')

    locale.value = 'en'
    expect(getLocalizedDescription(mockTmpl)).toBe('Room cleaning')

    locale.value = 'es'
    expect(getLocalizedDescription(mockTmpl)).toBe('Limpieza de la habitación')

    // 空の値のケース
    const emptyTmpl = { ...mockTmpl, descriptionJa: null }
    locale.value = 'ja'
    expect(getLocalizedDescription(emptyTmpl)).toBeNull()
  })

  it('getLocalizedRecommendation: 現在の言語に応じたおすすめメッセージを返す', () => {
    const { getLocalizedRecommendation } = useHouseworkTemplate()

    expect(getLocalizedRecommendation(mockTmpl)).toBe('週に一度')

    locale.value = 'en'
    expect(getLocalizedRecommendation(mockTmpl)).toBe('Once a week')

    locale.value = 'es'
    expect(getLocalizedRecommendation(mockTmpl)).toBe('Una vez por semana')

    // 空の値のケース
    const emptyTmpl = { ...mockTmpl, recommendationJa: null }
    locale.value = 'ja'
    expect(getLocalizedRecommendation(emptyTmpl)).toBeNull()
  })
})
