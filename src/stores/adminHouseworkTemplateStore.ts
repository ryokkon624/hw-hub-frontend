import { defineStore } from 'pinia'
import { adminApi } from '@/api/adminApi'
import type { AdminHouseworkTemplateRequest } from '@/api/adminApi'
import type { AdminHouseworkTemplateModel } from '@/domain'

export const useAdminHouseworkTemplateStore = defineStore('adminHouseworkTemplate', {
  state: () => ({
    items: [] as AdminHouseworkTemplateModel[],
    isLoading: false,
    isSubmitting: false,
  }),

  actions: {
    async loadAll() {
      if (this.isLoading) return
      this.isLoading = true
      try {
        this.items = await adminApi.fetchAdminHouseworkTemplates()
      } finally {
        this.isLoading = false
      }
    },

    async create(req: AdminHouseworkTemplateRequest) {
      this.isSubmitting = true
      try {
        const created = await adminApi.createAdminHouseworkTemplate(req)
        this.items = [created, ...this.items]
        return created
      } finally {
        this.isSubmitting = false
      }
    },

    async update(id: number, req: AdminHouseworkTemplateRequest) {
      this.isSubmitting = true
      try {
        await adminApi.updateAdminHouseworkTemplate(id, req)
        const idx = this.items.findIndex((t) => t.houseworkTemplateId === id)
        if (idx !== -1) this.items[idx] = { ...this.items[idx], ...req, houseworkTemplateId: id }
      } finally {
        this.isSubmitting = false
      }
    },

    async remove(id: number) {
      this.isSubmitting = true
      try {
        await adminApi.deleteAdminHouseworkTemplate(id)
        this.items = this.items.filter((t) => t.houseworkTemplateId !== id)
      } finally {
        this.isSubmitting = false
      }
    },

    clear() {
      this.items = []
    },
  },
})
