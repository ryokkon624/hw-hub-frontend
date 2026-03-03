import { defineStore } from 'pinia'
import { NOTIFICATION_GROUP, type NotificationGroupCode } from '@/constants/code.constants'
import { userApi } from '@/api/userApi'
import { useAuthStore } from '@/stores/authStore'

interface NotificationSettingsStoreState {
  isLoading: boolean
  notificationEnabled: boolean
  groupSettings: GroupSettings
}

type GroupSettings = Record<NotificationGroupCode, boolean>
const defaultGroups = (): GroupSettings => ({
  [NOTIFICATION_GROUP.HOUSEHOLD]: true,
  [NOTIFICATION_GROUP.TASK_ASSIGNMENT]: true,
})

export const useNotificationSettingsStore = defineStore('notificationSettings', {
  state: (): NotificationSettingsStoreState => ({
    isLoading: false,
    notificationEnabled: true,
    groupSettings: defaultGroups(),
  }),

  getters: {
    isGroupDisabled: (s) => !s.notificationEnabled,
  },

  actions: {
    async load() {
      this.isLoading = true
      try {
        const res = await userApi.getNotificationSettings()
        this.notificationEnabled = res.notificationEnabled
        this.groupSettings = res.groupSettings as unknown as GroupSettings
      } finally {
        this.isLoading = false
      }
    },

    async setGlobalEnabled(enabled: boolean) {
      this.isLoading = true
      try {
        const res = await userApi.updateNotificationSettings({
          notificationEnabled: enabled,
          groupSettings: {},
        })
        this.notificationEnabled = res.notificationEnabled
        this.groupSettings = res.groupSettings as unknown as GroupSettings

        const authStore = useAuthStore()
        authStore.patchCurrentUser({ notificationEnabled: res.notificationEnabled })
      } finally {
        this.isLoading = false
      }
    },

    async setGroupEnabled(group: NotificationGroupCode, enabled: boolean) {
      // UIではGlobalがOFFなら更新できない想定だが、念のため
      if (!this.notificationEnabled) return

      this.isLoading = true
      try {
        const res = await userApi.updateNotificationSettings({
          notificationEnabled: this.notificationEnabled,
          groupSettings: { [group]: enabled },
        })
        this.notificationEnabled = res.notificationEnabled
        this.groupSettings = res.groupSettings as unknown as GroupSettings
      } finally {
        this.isLoading = false
      }
    },
  },
})
