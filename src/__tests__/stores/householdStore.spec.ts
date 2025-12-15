import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHouseholdStore } from '@/stores/householdStore'
import { userApi } from '@/api/userApi'
import { householdApi } from '@/api/householdApi'
import { householdMemberApi } from '@/api/householdMemberApi'
import type { HouseholdModel, HouseholdMember } from '@/domain'

// --- mocks --------------------------------------------------------

vi.mock('@/api/userApi', () => ({
  userApi: {
    getUserHouseholds: vi.fn(),
  },
}))

vi.mock('@/api/householdApi', () => ({
  householdApi: {
    getHouseholdMembers: vi.fn(),
    updateHouseholdName: vi.fn(),
    createHousehold: vi.fn(),
  },
}))

vi.mock('@/api/householdMemberApi', () => ({
  householdMemberApi: {
    leaveMyself: vi.fn(),
    removeMember: vi.fn(),
  },
}))

const STORAGE_KEY = 'hwhub.currentHouseholdId'

// simple localStorage mock
const createLocalStorageMock = () => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
}

describe('householdStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    ;(globalThis as unknown as { localStorage: Storage }).localStorage =
      createLocalStorageMock() as unknown as Storage
  })

  it('初期状態では households は空で currentHouseholdId は null', () => {
    const store = useHouseholdStore()
    expect(store.households).toEqual([])
    expect(store.currentHouseholdId).toBeNull()
  })

  it('initFromStorage: 数値文字列なら currentHouseholdId を復元する', () => {
    localStorage.setItem(STORAGE_KEY, '123')

    const store = useHouseholdStore()
    store.initFromStorage()

    expect(store.currentHouseholdId).toBe(123)
  })

  it('initFromStorage: 数値に変換できない場合は無視する', () => {
    localStorage.setItem(STORAGE_KEY, 'abc')

    const store = useHouseholdStore()
    store.initFromStorage()

    expect(store.currentHouseholdId).toBeNull()
  })

  it('getter: currentHousehold / currentAllMembers / currentMembers / currentInvitedMembers', () => {
    const store = useHouseholdStore()

    const households: HouseholdModel[] = [
      { householdId: 1, name: 'A', ownerUserId: 1 },
      { householdId: 2, name: 'B', ownerUserId: 2 },
    ]
    store.households = households
    store.currentHouseholdId = 2

    const members: HouseholdMember[] = [
      {
        householdId: 2,
        userId: 1,
        displayName: 'Active',
        iconUrl: '',
        nickname: '',
        status: '1',
        role: 'MEMBER',
      },
      {
        householdId: 2,
        userId: 2,
        displayName: 'Invited',
        iconUrl: '',
        nickname: '',
        status: '0',
        role: 'MEMBER',
      },
      {
        householdId: 2,
        userId: 3,
        displayName: 'Deleted',
        iconUrl: '',
        nickname: '',
        status: '9',
        role: 'MEMBER',
      },
    ]
    store.membersByHouseholdId[2] = members

    expect(store.currentHousehold?.name).toBe('B')
    expect(store.currentAllMembers).toHaveLength(3)

    const actives = store.currentMembers
    expect(actives.map((m) => m.displayName)).toEqual(['Active', 'Invited'])

    const invited = store.currentInvitedMembers
    expect(invited.map((m) => m.displayName)).toEqual(['Invited'])
  })

  it('fetchMyHouseholds: households を更新し、currentHouseholdId が未設定なら先頭を選ぶ', async () => {
    const apiResult: HouseholdModel[] = [
      { householdId: 1, name: 'H1', ownerUserId: 1 },
      { householdId: 2, name: 'H2', ownerUserId: 1 },
    ]
    vi.mocked(userApi.getUserHouseholds).mockResolvedValue(apiResult)

    const store = useHouseholdStore()
    await store.fetchMyHouseholds()

    expect(userApi.getUserHouseholds).toHaveBeenCalled()
    expect(store.households).toHaveLength(2)
    expect(store.currentHouseholdId).toBe(1)
  })

  it('fetchMyHouseholds: 空配列なら currentHouseholdId を null にする', async () => {
    vi.mocked(userApi.getUserHouseholds).mockResolvedValue([])

    const store = useHouseholdStore()
    store.currentHouseholdId = 99

    await store.fetchMyHouseholds()

    expect(store.households).toEqual([])
    expect(store.currentHouseholdId).toBeNull()
  })

  it('fetchMembers: force:true のとき API を呼び、membersByHouseholdId を更新する', async () => {
    const members: HouseholdMember[] = [
      {
        householdId: 1,
        userId: 1,
        displayName: 'A',
        iconUrl: '',
        nickname: '',
        status: '1',
        role: 'MEMBER',
      },
    ]
    vi.mocked(householdApi.getHouseholdMembers).mockResolvedValue(members)

    const store = useHouseholdStore()
    await store.fetchMembers(1, { force: true })

    expect(householdApi.getHouseholdMembers).toHaveBeenCalledWith(1)
    expect(store.membersByHouseholdId[1]).toEqual(members)
    expect(store.lastFetchedAtByHouseholdId[1]).toBeGreaterThan(0)
  })

  it('fetchMembers: TTL 内のキャッシュがある場合は再取得しない', async () => {
    const store = useHouseholdStore()

    const members: HouseholdMember[] = [
      {
        householdId: 1,
        userId: 1,
        displayName: 'cached',
        iconUrl: '',
        nickname: '',
        status: '1',
        role: 'MEMBER',
      },
    ]
    store.membersByHouseholdId[1] = members
    store.lastFetchedAtByHouseholdId[1] = Date.now()

    await store.fetchMembers(1)

    expect(householdApi.getHouseholdMembers).not.toHaveBeenCalled()
    expect(store.membersByHouseholdId[1]).toEqual(members)
  })

  it('setCurrentHousehold: householdId を設定し localStorage に保存、fetchMembers を呼ぶ', async () => {
    const store = useHouseholdStore()
    const fetchMembersSpy = vi.spyOn(store, 'fetchMembers').mockResolvedValue(undefined)

    await store.setCurrentHousehold(10)

    expect(store.currentHouseholdId).toBe(10)
    expect(localStorage.getItem(STORAGE_KEY)).toBe('10')
    expect(fetchMembersSpy).toHaveBeenCalledWith(10)
  })

  it('setCurrentHousehold: null を指定すると localStorage からキーを削除する', async () => {
    localStorage.setItem(STORAGE_KEY, '5')
    const store = useHouseholdStore()

    await store.setCurrentHousehold(null)

    expect(store.currentHouseholdId).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('updateHouseholdNameLocal: メモリ上の世帯名だけを変更する', () => {
    const store = useHouseholdStore()
    const households: HouseholdModel[] = [
      { householdId: 1, name: 'Old', ownerUserId: 1 },
      { householdId: 2, name: 'Other', ownerUserId: 1 },
    ]
    store.households = households

    store.updateHouseholdNameLocal(1, 'NewName')

    expect(store.households).toHaveLength(2)

    const first = store.households[0]!
    const second = store.households[1]!

    expect(first.name).toBe('NewName')
    expect(second.name).toBe('Other')
  })

  it('updateHouseholdName: API を呼び、updateHouseholdNameLocal を通じて state を更新する', async () => {
    vi.mocked(householdApi.updateHouseholdName).mockResolvedValue(undefined)

    const store = useHouseholdStore()
    const households: HouseholdModel[] = [{ householdId: 1, name: 'Old', ownerUserId: 1 }]
    store.households = households

    const localSpy = vi.spyOn(store, 'updateHouseholdNameLocal')

    await store.updateHouseholdName(1, 'Updated')

    expect(householdApi.updateHouseholdName).toHaveBeenCalledWith(1, 'Updated')
    expect(localSpy).toHaveBeenCalledWith(1, 'Updated')
    expect(store.households[0]!.name).toBe('Updated')
  })

  it('createHousehold: 空文字だけの場合はエラーになる', async () => {
    const store = useHouseholdStore()

    await expect(store.createHousehold('   ')).rejects.toThrow('世帯名が空です')
  })

  it('createHousehold: 正常系では households に追加され currentHouseholdId も更新される', async () => {
    const created: HouseholdModel = {
      householdId: 10,
      name: 'Created',
      ownerUserId: 1,
    }
    // householdApi が string を受け取る前提
    vi.mocked(householdApi.createHousehold).mockResolvedValue(created)

    const store = useHouseholdStore()
    const fetchMembersSpy = vi.spyOn(store, 'fetchMembers').mockResolvedValue(undefined)

    // 既存の世帯が1件ある状態からスタート
    store.households = [{ householdId: 1, name: 'H1', ownerUserId: 1 }]

    await store.createHousehold('  Created  ')

    // トリムされて "Created" で呼ばれていること
    expect(householdApi.createHousehold).toHaveBeenCalledWith('Created')

    // households に追加されていること
    expect(store.households).toHaveLength(2)
    expect(store.households[1]).toEqual(created)

    // currentHouseholdId が新しいIDになっていること
    expect(store.currentHouseholdId).toBe(10)

    // fetchMembers が force:true で呼ばれていること
    expect(fetchMembersSpy).toHaveBeenCalledWith(10, { force: true })
  })

  it('leaveMyself: API を呼び、その後 fetchMyHouseholds を呼ぶ', async () => {
    const store = useHouseholdStore()
    const fetchMySpy = vi.spyOn(store, 'fetchMyHouseholds').mockResolvedValue(undefined)

    vi.mocked(householdMemberApi.leaveMyself).mockResolvedValue(undefined)

    await store.leaveMyself(1)

    expect(householdMemberApi.leaveMyself).toHaveBeenCalledWith(1)
    expect(fetchMySpy).toHaveBeenCalled()
  })

  it('removeMember: API 呼び出し後に fetchMembers を force:true で呼ぶ', async () => {
    const store = useHouseholdStore()
    const fetchMembersSpy = vi.spyOn(store, 'fetchMembers').mockResolvedValue(undefined)

    vi.mocked(householdMemberApi.removeMember).mockResolvedValue(undefined)

    await store.removeMember(2, 99)

    expect(householdMemberApi.removeMember).toHaveBeenCalledWith(2, 99)
    expect(fetchMembersSpy).toHaveBeenCalledWith(2, { force: true })
  })

  it('reset: state と localStorage をクリアする', () => {
    const store = useHouseholdStore()
    store.households = [{ householdId: 1, name: 'H', ownerUserId: 1 }]
    store.currentHouseholdId = 1
    localStorage.setItem(STORAGE_KEY, '1')

    store.reset()

    expect(store.households).toEqual([])
    expect(store.currentHouseholdId).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
