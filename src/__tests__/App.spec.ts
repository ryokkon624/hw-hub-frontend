// src/__tests__/App.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import App from '@/App.vue'
import { useAuthStore } from '@/stores/authStore'
import { useHouseholdStore } from '@/stores/householdStore'
import type { HouseholdModel } from '@/domain'

type MountOptions = {
  authenticated?: boolean
  households?: HouseholdModel[]
}

describe('App', () => {
  const mountWithStores = (options?: MountOptions) => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const authStore = useAuthStore()
    const householdStore = useHouseholdStore()

    // onMounted が走る前に状態をセットしておく
    authStore.accessToken = options?.authenticated ? 'dummy-token' : null
    householdStore.households = (options?.households ?? []) as HouseholdModel[]

    // メソッドを spy に差し替え
    authStore.initFromStorage = vi.fn()
    householdStore.initFromStorage = vi.fn()
    householdStore.fetchMyHouseholds = vi.fn().mockResolvedValue(undefined)

    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
        stubs: {
          RouterView: true,
        },
      },
    })

    return { wrapper, authStore, householdStore }
  }

  it('未ログインの場合: authStore.initFromStorage のみ実行される', async () => {
    const { wrapper, authStore, householdStore } = mountWithStores({
      authenticated: false,
      households: [],
    })

    // onMounted 完了待ち
    await nextTick()

    expect(wrapper.exists()).toBe(true)
    expect(authStore.initFromStorage).toHaveBeenCalledTimes(1)
    expect(householdStore.initFromStorage).not.toHaveBeenCalled()
    expect(householdStore.fetchMyHouseholds).not.toHaveBeenCalled()
  })

  it('ログイン済み & 世帯が既にある場合: fetchMyHouseholds は呼ばれない', async () => {
    const { authStore, householdStore } = mountWithStores({
      authenticated: true,
      households: [{ householdId: 1, name: 'H1', ownerUserId: 1 } as HouseholdModel],
    })

    await nextTick()

    expect(authStore.initFromStorage).toHaveBeenCalledTimes(1)
    expect(householdStore.initFromStorage).toHaveBeenCalledTimes(1)
    expect(householdStore.fetchMyHouseholds).not.toHaveBeenCalled()
  })

  it('ログイン済み & 世帯が 0件の場合: fetchMyHouseholds が呼ばれる', async () => {
    const { authStore, householdStore } = mountWithStores({
      authenticated: true,
      households: [],
    })

    await nextTick()

    expect(authStore.initFromStorage).toHaveBeenCalledTimes(1)
    expect(householdStore.initFromStorage).toHaveBeenCalledTimes(1)
    expect(householdStore.fetchMyHouseholds).toHaveBeenCalledTimes(1)
  })
})
