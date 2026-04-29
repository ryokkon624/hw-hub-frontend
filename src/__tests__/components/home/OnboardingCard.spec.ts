// src/__tests__/components/home/OnboardingCard.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import OnboardingCard from '@/components/home/OnboardingCard.vue'

// ---- stores のモック ----
const mockHouseholdStore = {
  currentHouseholdId: null as number | null,
}

const mockHouseworkStore = {
  items: [] as unknown[],
  isFetchedFor: vi.fn().mockReturnValue(false),
}

vi.mock('@/stores/householdStore', () => ({
  useHouseholdStore: () => mockHouseholdStore,
}))

vi.mock('@/stores/houseworkStore', () => ({
  useHouseworkStore: () => mockHouseworkStore,
}))

// vue-router のモック
const pushMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

// vue-i18n のモック（キーをそのまま返す）
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

describe('OnboardingCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockHouseholdStore.currentHouseholdId = null
    mockHouseworkStore.items = []
    mockHouseworkStore.isFetchedFor.mockReturnValue(false)
    pushMock.mockReset()
  })

  const mountCard = () =>
    mount(OnboardingCard, {
      global: {
        stubs: {
          OnboardingStepCard: {
            template:
              '<div class="stub-step-card" :data-is-done="isDone" :data-is-disabled="isButtonDisabled"><button @click="$emit(\'action\')">{{ buttonLabel }}</button></div>',
            props: ['icon', 'title', 'description', 'buttonLabel', 'isDone', 'isButtonDisabled'],
            emits: ['action'],
          },
        },
      },
    })

  it('世帯未所属かつ家事未登録のとき、カードが表示される', () => {
    mockHouseholdStore.currentHouseholdId = null

    const wrapper = mountCard()

    expect(wrapper.find('article').exists()).toBe(true)
  })

  it('世帯所属済みかつ家事登録済みのとき、カードが非表示になる', () => {
    mockHouseholdStore.currentHouseholdId = 1
    mockHouseworkStore.isFetchedFor.mockReturnValue(true)
    mockHouseworkStore.items = [{ houseworkId: 1 }]

    const wrapper = mountCard()

    expect(wrapper.find('article').exists()).toBe(false)
  })

  it('世帯所属済みだが家事未登録のとき、カードが表示される', () => {
    mockHouseholdStore.currentHouseholdId = 1
    mockHouseworkStore.isFetchedFor.mockReturnValue(true)
    mockHouseworkStore.items = []

    const wrapper = mountCard()

    expect(wrapper.find('article').exists()).toBe(true)
  })

  it('Step1 のアクションで settings.household へ遷移する', async () => {
    mockHouseholdStore.currentHouseholdId = null

    const wrapper = mountCard()
    // Step1 は最初の stub-step-card
    const stepCards = wrapper.findAll('.stub-step-card')
    await stepCards[0]?.find('button').trigger('click')

    expect(pushMock).toHaveBeenCalledWith({ name: 'settings.household' })
  })

  it('世帯所属済み・家事未登録のとき Step2 のアクションで settings.housework へ遷移する', async () => {
    mockHouseholdStore.currentHouseholdId = 1
    mockHouseworkStore.isFetchedFor.mockReturnValue(true)
    mockHouseworkStore.items = []

    const wrapper = mountCard()
    const stepCards = wrapper.findAll('.stub-step-card')
    await stepCards[1]?.find('button').trigger('click')

    expect(pushMock).toHaveBeenCalledWith({ name: 'settings.housework' })
  })

  it('世帯未所属のとき Step1 は isDone=false で Step2 は isButtonDisabled=true になる', () => {
    mockHouseholdStore.currentHouseholdId = null

    const wrapper = mountCard()
    const stepCards = wrapper.findAll('.stub-step-card')

    expect(stepCards[0]?.attributes('data-is-done')).toBe('false')
    expect(stepCards[1]?.attributes('data-is-disabled')).toBe('true')
  })

  it('世帯所属済みのとき Step1 は isDone=true になる', () => {
    mockHouseholdStore.currentHouseholdId = 1
    mockHouseworkStore.isFetchedFor.mockReturnValue(false)

    const wrapper = mountCard()
    const stepCards = wrapper.findAll('.stub-step-card')

    expect(stepCards[0]?.attributes('data-is-done')).toBe('true')
  })
})
