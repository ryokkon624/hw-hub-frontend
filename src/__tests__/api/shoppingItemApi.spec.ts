import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shoppingItemApi } from '@/api/shoppingItemApi'
import { apiClient } from '@/api/client'
import type {
  ShoppingItemCreateInput,
  ShoppingItemUpdateInput,
  ShoppingItemHistorySuggestionModel,
} from '@/domain'
import { FAVORITE_FLAG } from '@/constants/code.constants'

type MockedApiClient = {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  put: ReturnType<typeof vi.fn>
  patch: ReturnType<typeof vi.fn>
}

const mockedClient = apiClient as unknown as MockedApiClient

vi.mock('@/api/client', () => {
  return {
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
    },
  }
})

describe('shoppingItemApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getShoppingItems', () => {
    it('GET /api/households/:id/shopping-items して DTO を Domain Model に変換する', async () => {
      const dtoList = [
        {
          shoppingItemId: 1,
          householdId: 10,
          name: '牛乳',
          memo: '特売品',
          storeType: '01',
          status: '1',
          favorite: FAVORITE_FLAG.FAVORITE,
          purchasedAt: '2025-01-01',
          createdAt: '2025-01-01T00:00:00Z',
          hasImage: true,
        },
        {
          shoppingItemId: 2,
          householdId: 10,
          name: 'パン',
          memo: null,
          storeType: '02',
          status: '2',
          favorite: FAVORITE_FLAG.NORMAL,
          purchasedAt: null,
          createdAt: '2025-01-02T00:00:00Z',
          hasImage: false,
        },
      ]

      mockedClient.get.mockResolvedValue({
        data: {
          items: dtoList,
        },
      })

      const result = await shoppingItemApi.getShoppingItems(10)

      expect(mockedClient.get).toHaveBeenCalledTimes(1)
      expect(mockedClient.get).toHaveBeenCalledWith('/api/households/10/shopping-items')

      expect(result).toEqual([
        {
          shoppingItemId: 1,
          householdId: 10,
          name: '牛乳',
          memo: '特売品',
          storeType: '01',
          status: '1',
          favorite: true,
          purchasedAt: '2025-01-01',
          createdAt: '2025-01-01T00:00:00Z',
          hasImage: true,
        },
        {
          shoppingItemId: 2,
          householdId: 10,
          name: 'パン',
          memo: null,
          storeType: '02',
          status: '2',
          favorite: false,
          purchasedAt: null,
          createdAt: '2025-01-02T00:00:00Z',
          hasImage: false,
        },
      ])
    })
  })

  describe('getFavoriteShoppingItems', () => {
    it('GET /api/households/:id/shopping-items/favorites して DTO を Domain Model に変換する', async () => {
      const dtoList = [
        {
          shoppingItemId: 1,
          householdId: 10,
          name: '牛乳',
          memo: '特売品',
          storeType: '01',
          status: '1',
          favorite: FAVORITE_FLAG.FAVORITE,
          purchasedAt: '2025-01-01',
          createdAt: '2025-01-01T00:00:00Z',
          hasImage: true,
        },
      ]

      mockedClient.get.mockResolvedValue({
        data: {
          items: dtoList,
        },
      })

      const result = await shoppingItemApi.getFavoriteShoppingItems(10)

      expect(mockedClient.get).toHaveBeenCalledTimes(1)
      expect(mockedClient.get).toHaveBeenCalledWith('/api/households/10/shopping-items/favorites')

      expect(result).toEqual([
        {
          shoppingItemId: 1,
          householdId: 10,
          name: '牛乳',
          memo: '特売品',
          storeType: '01',
          status: '1',
          favorite: true,
          purchasedAt: '2025-01-01',
          createdAt: '2025-01-01T00:00:00Z',
          hasImage: true,
        },
      ])
    })
  })

  describe('createItem', () => {
    it('POST /api/households/:id/shopping-items に Request DTO を渡し、戻り値を Domain Model に変換する', async () => {
      const input: ShoppingItemCreateInput = {
        name: '卵',
        memo: '10個入り',
        storeType: '1',
        favorite: true,
        sourceShoppingItemId: 99,
      }

      const dto = {
        shoppingItemId: 3,
        householdId: 10,
        name: '卵',
        memo: '10個入り',
        storeType: '1',
        status: '1',
        favorite: FAVORITE_FLAG.FAVORITE,
        purchasedAt: null,
        createdAt: '2025-01-03T00:00:00Z',
        hasImage: false,
      }

      mockedClient.post.mockResolvedValue({
        data: dto,
      })

      const result = await shoppingItemApi.createItem(10, input)

      expect(mockedClient.post).toHaveBeenCalledTimes(1)
      expect(mockedClient.post).toHaveBeenCalledWith('/api/households/10/shopping-items', {
        name: '卵',
        memo: '10個入り',
        storeType: '1',
        favorite: FAVORITE_FLAG.FAVORITE,
        sourceShoppingItemId: 99,
      })

      expect(result).toEqual({
        shoppingItemId: 3,
        householdId: 10,
        name: '卵',
        memo: '10個入り',
        storeType: '1',
        status: '1',
        favorite: true,
        purchasedAt: null,
        createdAt: '2025-01-03T00:00:00Z',
        hasImage: false,
      })
    })

    it('favorite / sourceShoppingItemId が undefined の場合、DTO では undefined / null に変換される', async () => {
      const input: ShoppingItemCreateInput = {
        name: 'バナナ',
        memo: null,
        storeType: '1',
        sourceShoppingItemId: undefined,
      }

      mockedClient.post.mockResolvedValue({
        data: {
          shoppingItemId: 4,
          householdId: 11,
          name: 'バナナ',
          memo: null,
          storeType: '1',
          status: '1',
          favorite: FAVORITE_FLAG.NORMAL,
          purchasedAt: null,
          createdAt: '2025-01-04T00:00:00Z',
          hasImage: false,
        },
      })

      await shoppingItemApi.createItem(11, input)

      expect(mockedClient.post).toHaveBeenCalledTimes(1)

      const firstCall = mockedClient.post.mock.calls[0]
      expect(firstCall).toBeDefined()

      const payload = firstCall![1]

      expect(payload).toMatchObject({
        name: 'バナナ',
        memo: null,
        storeType: '1',
        sourceShoppingItemId: null,
      })
      // favorite は undefined（プロパティとして存在するが値 undefined）であること
      expect(Object.prototype.hasOwnProperty.call(payload, 'favorite')).toBe(true)
      expect(payload.favorite).toBeUndefined()
    })
  })

  describe('updateItem', () => {
    it('PUT /api/households/:id/shopping-items/:itemId に Request DTO を渡し、戻り値を Domain Model に変換する', async () => {
      const input: ShoppingItemUpdateInput = {
        name: '牛乳（低脂肪）',
        memo: '1L',
        storeType: '1',
        favorite: false,
      }

      const dto = {
        shoppingItemId: 1,
        householdId: 10,
        name: '牛乳（低脂肪）',
        memo: '1L',
        storeType: '1',
        status: '2',
        favorite: FAVORITE_FLAG.NORMAL,
        purchasedAt: null,
        createdAt: '2025-01-01T00:00:00Z',
        hasImage: true,
      }

      mockedClient.put.mockResolvedValue({
        data: dto,
      })

      const result = await shoppingItemApi.updateItem(10, 1, input)

      expect(mockedClient.put).toHaveBeenCalledTimes(1)
      expect(mockedClient.put).toHaveBeenCalledWith('/api/households/10/shopping-items/1', {
        name: '牛乳（低脂肪）',
        memo: '1L',
        storeType: '1',
        favorite: FAVORITE_FLAG.NORMAL,
      })

      expect(result.favorite).toBe(false)
      expect(result.name).toBe('牛乳（低脂肪）')
    })
  })

  describe('updateStatus', () => {
    it('PATCH /api/shopping-items/:id/status を正しい payload で呼び出す', async () => {
      mockedClient.patch.mockResolvedValue({})

      await shoppingItemApi.updateStatus(5, '2')

      expect(mockedClient.patch).toHaveBeenCalledTimes(1)
      expect(mockedClient.patch).toHaveBeenCalledWith('/api/shopping-items/5/status', {
        status: '2',
      })
    })
  })

  describe('toggleFavorite', () => {
    it('PATCH /api/shopping-items/:id/favorite を正しい payload で呼び出す', async () => {
      mockedClient.patch.mockResolvedValue({})

      await shoppingItemApi.toggleFavorite(6, FAVORITE_FLAG.FAVORITE)

      expect(mockedClient.patch).toHaveBeenCalledTimes(1)
      expect(mockedClient.patch).toHaveBeenCalledWith('/api/shopping-items/6/favorite', {
        favorite: FAVORITE_FLAG.FAVORITE,
      })
    })
  })

  describe('listHistorySuggestions', () => {
    it('GET /api/households/:id/shopping-items/history-suggestions を params 付きで呼び出し、DTO を Domain Model に変換する', async () => {
      const dtoList = [
        {
          name: '牛乳',
          storeType: '1',
          lastPurchasedDate: '2025-01-10',
          purchaseCount: 5,
          sourceShoppingItemId: 100,
        },
        {
          name: 'パン',
          storeType: '2',
          lastPurchasedDate: '2025-01-11',
          purchaseCount: 3,
          sourceShoppingItemId: 101,
        },
      ]

      mockedClient.get.mockResolvedValue({
        data: dtoList,
      })

      const params = { q: '牛', storeType: '1', limit: 10 }

      const result = await shoppingItemApi.listHistorySuggestions(10, params)

      expect(mockedClient.get).toHaveBeenCalledTimes(1)
      expect(mockedClient.get).toHaveBeenCalledWith(
        '/api/households/10/shopping-items/history-suggestions',
        { params },
      )

      const expected: ShoppingItemHistorySuggestionModel[] = [
        {
          name: '牛乳',
          storeType: '1',
          lastPurchasedDate: '2025-01-10',
          purchaseCount: 5,
          sourceShoppingItemId: 100,
          hasImage: false,
        },
        {
          name: 'パン',
          storeType: '2',
          lastPurchasedDate: '2025-01-11',
          purchaseCount: 3,
          sourceShoppingItemId: 101,
          hasImage: false,
        },
      ]

      expect(result).toEqual(expected)
    })
  })
})
