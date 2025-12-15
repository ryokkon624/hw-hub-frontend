import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { useHouseworkStore } from '@/stores/houseworkStore'
import { houseworkApi } from '@/api/houseworkApi'
import type { Housework, HouseworkSaveInput } from '@/domain'

// ----- householdStore をモック（currentHouseholdId だけ使う） -----
const householdStoreMock = {
  currentHouseholdId: 1 as number | null,
}

vi.mock('@/stores/householdStore', () => ({
  useHouseholdStore: () => householdStoreMock,
}))

// ----- houseworkApi をモック -----
vi.mock('@/api/houseworkApi', () => ({
  houseworkApi: {
    fetchHouseworks: vi.fn(),
    getHousework: vi.fn(),
    createHousework: vi.fn(),
    updateHousework: vi.fn(),
    deleteHousework: vi.fn(),
  },
}))

const mockedHouseworkApi = vi.mocked(houseworkApi, true)

const makeHousework = (overrides?: Partial<Housework>): Housework =>
  ({
    houseworkId: 1,
    householdId: 1,
    name: '掃除',
    description: '部屋掃除',
    categoryCode: null,
    recurrenceTypeCode: '1',
    weeklyDaysMask: null,
    dayOfMonth: null,
    nthWeek: null,
    weekday: null,
    defaultAssigneeUserId: null,
    isToday: false,
    ...overrides,
  }) as Housework

const makeInput = (overrides?: Partial<HouseworkSaveInput>): HouseworkSaveInput =>
  ({
    name: '掃除',
    description: '部屋掃除',
    categoryCode: null,
    recurrenceTypeCode: '1',
    weeklyDaysMask: null,
    dayOfMonth: null,
    nthWeek: null,
    weekday: null,
    defaultAssigneeUserId: null,
    ...overrides,
  }) as HouseworkSaveInput

describe('houseworkStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    householdStoreMock.currentHouseholdId = 1
  })

  it('loadAll: 世帯未選択なら items を空にして API を呼ばない', async () => {
    householdStoreMock.currentHouseholdId = null
    const store = useHouseworkStore()
    store.items = [makeHousework()]

    await store.loadAll()

    expect(store.items).toEqual([])
    expect(mockedHouseworkApi.fetchHouseworks).not.toHaveBeenCalled()
  })

  it('loadAll: TTL 内ならキャッシュを利用し、API を呼ばない', async () => {
    const store = useHouseworkStore()
    const hw = makeHousework({ houseworkId: 1, name: 'H1' })

    const now = 1_000_000
    vi.spyOn(Date, 'now').mockReturnValue(now)

    store.itemsByHouseholdId[1] = [hw]
    store.lastFetchedAtByHouseholdId[1] = now
    store.items = []

    await store.loadAll()

    expect(mockedHouseworkApi.fetchHouseworks).not.toHaveBeenCalled()
    expect(store.items).toEqual([hw])
  })

  it('loadAll: force 指定時は TTL に関係なく API から再取得する', async () => {
    const store = useHouseworkStore()
    const cached = makeHousework({ houseworkId: 1, name: 'cached' })
    const fetched = makeHousework({ houseworkId: 2, name: 'fetched' })

    const now = 1_000_000
    vi.spyOn(Date, 'now').mockReturnValue(now)

    store.itemsByHouseholdId[1] = [cached]
    store.lastFetchedAtByHouseholdId[1] = now

    mockedHouseworkApi.fetchHouseworks.mockResolvedValue([fetched])

    await store.loadAll({ force: true })

    expect(mockedHouseworkApi.fetchHouseworks).toHaveBeenCalledWith(1)
    expect(store.items).toEqual([fetched])
    expect(store.itemsByHouseholdId[1]).toEqual([fetched])
    expect(store.lastFetchedAtByHouseholdId[1]).toBe(now)
  })

  it('loadOne: items に存在しない場合は追加し current も更新する', async () => {
    const store = useHouseworkStore()
    const hw = makeHousework({ houseworkId: 10, name: '単体' })

    mockedHouseworkApi.getHousework.mockResolvedValue(hw)

    const result = await store.loadOne(10)

    expect(mockedHouseworkApi.getHousework).toHaveBeenCalledWith(10)
    expect(result).toEqual(hw)
    expect(store.items).toHaveLength(1)
    expect(store.items[0]).toEqual(hw)
    expect(store.current).toEqual(hw)
  })

  it('loadOne: items に存在する場合は差し替えつつ current を更新する', async () => {
    const store = useHouseworkStore()
    const existing = makeHousework({ houseworkId: 10, name: '古い' })
    store.items = [existing]

    const updated = makeHousework({ houseworkId: 10, name: '新しい' })
    mockedHouseworkApi.getHousework.mockResolvedValue(updated)

    const result = await store.loadOne(10)

    expect(result).toEqual(updated)
    expect(store.items).toHaveLength(1)
    expect(store.items[0]).toEqual(updated)
    expect(store.current).toEqual(updated)
  })

  it('create: 世帯未選択ならエラーを投げて API を呼ばない', async () => {
    householdStoreMock.currentHouseholdId = null
    const store = useHouseworkStore()

    await expect(store.create(makeInput())).rejects.toThrow('世帯が選択されていません')
    expect(mockedHouseworkApi.createHousework).not.toHaveBeenCalled()
  })

  it('create: 正常系では items / itemsByHouseholdId を更新し、新しい家事を返す', async () => {
    const store = useHouseworkStore()
    store.items = [makeHousework({ houseworkId: 1, name: '既存' })]
    store.itemsByHouseholdId[1] = [...store.items]

    const created = makeHousework({ houseworkId: 2, name: '追加' })
    mockedHouseworkApi.createHousework.mockResolvedValue(created)

    const input = makeInput({ name: '追加' })
    const result = await store.create(input)

    expect(mockedHouseworkApi.createHousework).toHaveBeenCalledWith(1, input)
    expect(result).toEqual(created)
    expect(store.items).toHaveLength(2)
    expect(store.items[1]).toEqual(created)
    expect(store.itemsByHouseholdId[1]).toHaveLength(2)
    expect(store.itemsByHouseholdId[1][1]).toEqual(created)
  })

  it('update: 世帯未選択ならエラーを投げて API を呼ばない', async () => {
    householdStoreMock.currentHouseholdId = null
    const store = useHouseworkStore()

    await expect(store.update(1, makeInput())).rejects.toThrow('世帯が選択されていません')
    expect(mockedHouseworkApi.updateHousework).not.toHaveBeenCalled()
  })

  it('update: 正常系では items / itemsByHouseholdId / current を更新する', async () => {
    const store = useHouseworkStore()
    const original = makeHousework({ houseworkId: 10, name: '旧' })
    const cached = makeHousework({ houseworkId: 10, name: '旧 (cache)' })

    store.items = [original]
    store.itemsByHouseholdId[1] = [cached]

    const updated = makeHousework({ houseworkId: 10, name: '更新後' })
    mockedHouseworkApi.updateHousework.mockResolvedValue(updated)

    const input = makeInput({ name: '更新後' })
    const result = await store.update(10, input)

    expect(mockedHouseworkApi.updateHousework).toHaveBeenCalledWith(1, 10, input)
    expect(result).toEqual(updated)

    expect(store.current).toEqual(updated)
    expect(store.items[0]).toEqual(updated)
    expect(store.itemsByHouseholdId[1][0]).toEqual(updated)
  })

  it('delete: 対象家事を items / itemsByHouseholdId から削除し、current も必要ならクリアする', async () => {
    const store = useHouseworkStore()
    const h1 = makeHousework({ houseworkId: 1, name: '残る' })
    const h2 = makeHousework({ houseworkId: 2, name: '消える' })

    store.items = [h1, h2]
    store.itemsByHouseholdId[1] = [h1, h2]
    store.current = h2

    mockedHouseworkApi.deleteHousework.mockResolvedValue()

    await store.delete(2)

    expect(mockedHouseworkApi.deleteHousework).toHaveBeenCalledWith(2)
    expect(store.items).toEqual([h1])
    expect(store.itemsByHouseholdId[1]).toEqual([h1])
    expect(store.current).toBeNull()
  })

  it('clear: items と current をクリアする', () => {
    const store = useHouseworkStore()
    store.items = [makeHousework()]
    store.current = makeHousework({ houseworkId: 99 })

    store.clear()

    expect(store.items).toEqual([])
    expect(store.current).toBeNull()
  })
})
