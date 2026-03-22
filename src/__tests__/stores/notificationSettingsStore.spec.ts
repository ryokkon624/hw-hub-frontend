import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationSettingsStore } from '@/stores/notificationSettingsStore'
import { userApi } from '@/api/userApi'
import { NOTIFICATION_GROUP } from '@/constants/code.constants'

// --- モジュールモック ---

vi.mock('@/api/userApi', () => ({
  userApi: {
    getNotificationSettings: vi.fn(),
    updateNotificationSettings: vi.fn(),
  },
}))

const mockAuthStore = {
  patchCurrentUser: vi.fn(),
}

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockAuthStore,
}))

describe('notificationSettingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // --- 初期状態 ---

  it('初期状態が正しく設定されている', () => {
    const store = useNotificationSettingsStore()

    expect(store.isLoading).toBe(false)
    expect(store.notificationEnabled).toBe(true)
    expect(store.groupSettings).toMatchObject({
      [NOTIFICATION_GROUP.HOUSEHOLD]: true,
      [NOTIFICATION_GROUP.TASK_ASSIGNMENT]: true,
      [NOTIFICATION_GROUP.INQUIRY]: true,
    })
  })

  // --- getter ---

  it('isGroupDisabled は notificationEnabled が false の場合 true を返す', () => {
    const store = useNotificationSettingsStore()
    store.notificationEnabled = false

    expect(store.isGroupDisabled).toBe(true)
  })

  it('isGroupDisabled は notificationEnabled が true の場合 false を返す', () => {
    const store = useNotificationSettingsStore()
    store.notificationEnabled = true

    expect(store.isGroupDisabled).toBe(false)
  })

  // --- load ---

  describe('load', () => {
    it('通知設定を取得して state を更新する', async () => {
      const store = useNotificationSettingsStore()
      const responseData = {
        notificationEnabled: false,
        groupSettings: {
          [NOTIFICATION_GROUP.HOUSEHOLD]: false,
          [NOTIFICATION_GROUP.TASK_ASSIGNMENT]: true,
        },
      }
      vi.mocked(userApi.getNotificationSettings).mockResolvedValue(responseData)

      const promise = store.load()
      expect(store.isLoading).toBe(true)
      await promise

      expect(store.isLoading).toBe(false)
      expect(store.notificationEnabled).toBe(false)
      expect(store.groupSettings).toEqual(responseData.groupSettings)
      expect(userApi.getNotificationSettings).toHaveBeenCalledTimes(1)
    })

    it('APIエラー時でも isLoading を false に戻す', async () => {
      const store = useNotificationSettingsStore()
      vi.mocked(userApi.getNotificationSettings).mockRejectedValue(new Error('API error'))

      await expect(store.load()).rejects.toThrow('API error')
      expect(store.isLoading).toBe(false)
    })
  })

  // --- setGlobalEnabled ---

  describe('setGlobalEnabled', () => {
    it('グローバル通知をONにして state と authStore を更新する', async () => {
      const store = useNotificationSettingsStore()
      const responseData = {
        notificationEnabled: true,
        groupSettings: {
          [NOTIFICATION_GROUP.HOUSEHOLD]: true,
          [NOTIFICATION_GROUP.TASK_ASSIGNMENT]: true,
        },
      }
      vi.mocked(userApi.updateNotificationSettings).mockResolvedValue(responseData)

      const promise = store.setGlobalEnabled(true)
      expect(store.isLoading).toBe(true)
      await promise

      expect(store.isLoading).toBe(false)
      expect(store.notificationEnabled).toBe(true)
      expect(store.groupSettings).toEqual(responseData.groupSettings)
      expect(userApi.updateNotificationSettings).toHaveBeenCalledWith({
        notificationEnabled: true,
        groupSettings: {},
      })
      expect(mockAuthStore.patchCurrentUser).toHaveBeenCalledWith({
        notificationEnabled: true,
      })
    })

    it('グローバル通知をOFFにして state と authStore を更新する', async () => {
      const store = useNotificationSettingsStore()
      const responseData = {
        notificationEnabled: false,
        groupSettings: {
          [NOTIFICATION_GROUP.HOUSEHOLD]: true,
          [NOTIFICATION_GROUP.TASK_ASSIGNMENT]: true,
        },
      }
      vi.mocked(userApi.updateNotificationSettings).mockResolvedValue(responseData)

      await store.setGlobalEnabled(false)

      expect(userApi.updateNotificationSettings).toHaveBeenCalledWith({
        notificationEnabled: false,
        groupSettings: {},
      })
      expect(mockAuthStore.patchCurrentUser).toHaveBeenCalledWith({
        notificationEnabled: false,
      })
    })

    it('APIエラー時でも isLoading を false に戻す', async () => {
      const store = useNotificationSettingsStore()
      vi.mocked(userApi.updateNotificationSettings).mockRejectedValue(new Error('update error'))

      await expect(store.setGlobalEnabled(true)).rejects.toThrow('update error')
      expect(store.isLoading).toBe(false)
    })
  })

  // --- setGroupEnabled ---

  describe('setGroupEnabled', () => {
    it('グループ単位の通知設定を更新する', async () => {
      const store = useNotificationSettingsStore()
      store.notificationEnabled = true

      const responseData = {
        notificationEnabled: true,
        groupSettings: {
          [NOTIFICATION_GROUP.HOUSEHOLD]: false,
          [NOTIFICATION_GROUP.TASK_ASSIGNMENT]: true,
        },
      }
      vi.mocked(userApi.updateNotificationSettings).mockResolvedValue(responseData)

      const promise = store.setGroupEnabled(NOTIFICATION_GROUP.HOUSEHOLD, false)
      expect(store.isLoading).toBe(true)
      await promise

      expect(store.isLoading).toBe(false)
      expect(store.notificationEnabled).toBe(true)
      expect(store.groupSettings).toEqual(responseData.groupSettings)
      expect(userApi.updateNotificationSettings).toHaveBeenCalledWith({
        notificationEnabled: true,
        groupSettings: { [NOTIFICATION_GROUP.HOUSEHOLD]: false },
      })
    })

    it('notificationEnabled が false の場合は何もしない', async () => {
      const store = useNotificationSettingsStore()
      store.notificationEnabled = false

      await store.setGroupEnabled(NOTIFICATION_GROUP.HOUSEHOLD, true)

      expect(userApi.updateNotificationSettings).not.toHaveBeenCalled()
      expect(store.isLoading).toBe(false)
    })

    it('APIエラー時でも isLoading を false に戻す', async () => {
      const store = useNotificationSettingsStore()
      store.notificationEnabled = true
      vi.mocked(userApi.updateNotificationSettings).mockRejectedValue(new Error('group error'))

      await expect(
        store.setGroupEnabled(NOTIFICATION_GROUP.TASK_ASSIGNMENT, false),
      ).rejects.toThrow('group error')
      expect(store.isLoading).toBe(false)
    })
  })
})
