import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useShoppingHistoryStore } from '@/stores/shoppingHistoryStore'
import { shoppingItemApi } from '@/api/shoppingItemApi'
import type { ShoppingItemHistorySuggestionModel } from '@/domain'

vi.mock('@/api/shoppingItemApi', () => ({
  shoppingItemApi: {
    listHistorySuggestions: vi.fn(),
  },
}))

const createSuggestion = (
  overrides: Partial<ShoppingItemHistorySuggestionModel> = {},
): ShoppingItemHistorySuggestionModel =>
  ({
    sourceShoppingItemId: 1,
    householdId: 1,
    name: '牛乳',
    lastPurchasedAt: '2025-01-01T00:00:00Z',
    storeType: '1',
    frequencyDays: 7,
    ...overrides,
  }) as ShoppingItemHistorySuggestionModel

describe('shoppingHistoryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('suggestions getter は householdId が null の場合は空配列を返す', () => {
    const store = useShoppingHistoryStore()

    const result = store.suggestions(null)
    expect(result).toEqual([])
  })

  it('suggestions getter は指定された householdId のサジェストを返す', () => {
    const store = useShoppingHistoryStore()
    const list: ShoppingItemHistorySuggestionModel[] = [
      createSuggestion({ sourceShoppingItemId: 1, name: '牛乳' }),
      createSuggestion({ sourceShoppingItemId: 2, name: 'パン' }),
    ]
    store.suggestionsByHouseholdId[1] = list

    const result = store.suggestions(1)
    expect(result).toEqual(list)
  })

  it('fetchSuggestions は householdId が 0/undefined の場合は何もしない', async () => {
    const store = useShoppingHistoryStore()

    await store.fetchSuggestions(0)
    expect(shoppingItemApi.listHistorySuggestions).not.toHaveBeenCalled()
  })

  it('fetchSuggestions はキャッシュがない場合 API を呼び、suggestionsByHouseholdId を更新する', async () => {
    const store = useShoppingHistoryStore()

    const suggestions: ShoppingItemHistorySuggestionModel[] = [
      createSuggestion({ sourceShoppingItemId: 1, name: '牛乳' }),
      createSuggestion({ sourceShoppingItemId: 2, name: 'パン' }),
    ]

    vi.mocked(shoppingItemApi.listHistorySuggestions).mockResolvedValue(suggestions)

    await store.fetchSuggestions(1, { q: '牛', storeType: '1', limit: 10 })

    expect(shoppingItemApi.listHistorySuggestions).toHaveBeenCalledTimes(1)
    expect(shoppingItemApi.listHistorySuggestions).toHaveBeenCalledWith(1, {
      q: '牛',
      storeType: '1',
      limit: 10,
    })
    expect(store.suggestionsByHouseholdId[1]).toEqual(suggestions)
  })

  it('fetchSuggestions は limit 未指定の場合にデフォルト 20 を使う', async () => {
    const store = useShoppingHistoryStore()

    const suggestions: ShoppingItemHistorySuggestionModel[] = [
      createSuggestion({ sourceShoppingItemId: 1 }),
    ]

    vi.mocked(shoppingItemApi.listHistorySuggestions).mockResolvedValue(suggestions)

    await store.fetchSuggestions(1, { q: '牛', storeType: '1' })

    expect(shoppingItemApi.listHistorySuggestions).toHaveBeenCalledWith(1, {
      q: '牛',
      storeType: '1',
      limit: 20,
    })
  })

  it('fetchSuggestions は既にキャッシュがあり force 指定がない場合、API を呼ばない', async () => {
    const store = useShoppingHistoryStore()

    const cached: ShoppingItemHistorySuggestionModel[] = [
      createSuggestion({ sourceShoppingItemId: 1, name: 'キャッシュ牛乳' }),
    ]
    store.suggestionsByHouseholdId[1] = cached

    await store.fetchSuggestions(1, { q: '牛' })

    expect(shoppingItemApi.listHistorySuggestions).not.toHaveBeenCalled()
    expect(store.suggestionsByHouseholdId[1]).toEqual(cached)
  })

  it('fetchSuggestions は force:true の場合、キャッシュがあっても再取得する', async () => {
    const store = useShoppingHistoryStore()

    const cached: ShoppingItemHistorySuggestionModel[] = [
      createSuggestion({ sourceShoppingItemId: 1, name: '古い牛乳' }),
    ]
    store.suggestionsByHouseholdId[1] = cached

    const fresh: ShoppingItemHistorySuggestionModel[] = [
      createSuggestion({ sourceShoppingItemId: 2, name: '新しい牛乳' }),
    ]
    vi.mocked(shoppingItemApi.listHistorySuggestions).mockResolvedValue(fresh)

    await store.fetchSuggestions(1, { force: true, q: '牛' })

    expect(shoppingItemApi.listHistorySuggestions).toHaveBeenCalledTimes(1)
    expect(store.suggestionsByHouseholdId[1]).toEqual(fresh)
  })

  it('clearForHousehold は対象世帯のサジェストを削除する', () => {
    const store = useShoppingHistoryStore()

    store.suggestionsByHouseholdId[1] = [createSuggestion({ sourceShoppingItemId: 1 })]
    store.suggestionsByHouseholdId[2] = [createSuggestion({ sourceShoppingItemId: 2 })]

    store.clearForHousehold(1)

    expect(store.suggestionsByHouseholdId[1]).toBeUndefined()
    expect(store.suggestionsByHouseholdId[2]).toBeDefined()
  })
})
