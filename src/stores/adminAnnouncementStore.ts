import { defineStore } from 'pinia'
import { adminApi } from '@/api/adminApi'
import type { AdminAnnouncementRequest } from '@/api/adminApi'
import type { AdminAnnouncementModel } from '@/domain'

export const useAdminAnnouncementStore = defineStore('adminAnnouncement', {
  state: () => ({
    items: [] as AdminAnnouncementModel[],
    isLoading: false,
    isSubmitting: false,
  }),

  actions: {
    async loadAll() {
      if (this.isLoading) return
      this.isLoading = true
      try {
        this.items = await adminApi.fetchAdminAnnouncements()
      } finally {
        this.isLoading = false
      }
    },

    async create(req: AdminAnnouncementRequest) {
      this.isSubmitting = true
      try {
        const created = await adminApi.createAdminAnnouncement(req)
        this.items = [created, ...this.items]
        return created
      } finally {
        this.isSubmitting = false
      }
    },

    async update(id: number, req: AdminAnnouncementRequest) {
      this.isSubmitting = true
      try {
        await adminApi.updateAdminAnnouncement(id, req)
        const idx = this.items.findIndex((a) => a.id === id)
        if (idx !== -1) this.items[idx] = { ...this.items[idx], ...req, id }
      } finally {
        this.isSubmitting = false
      }
    },

    async remove(id: number) {
      this.isSubmitting = true
      try {
        await adminApi.deleteAdminAnnouncement(id)
        this.items = this.items.filter((a) => a.id !== id)
      } finally {
        this.isSubmitting = false
      }
    },

    clear() {
      this.items = []
    },
  },
})
