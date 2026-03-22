import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRoleStore } from '@/stores/roleStore'
import { useRole } from '@/composables/useRole'

describe('useRole', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('hasRole', () => {
    it('指定したロールを持っている場合はtrueを返す', () => {
      const store = useRoleStore()
      store.roles = ['ADMIN'] as typeof store.roles
      const { hasRole } = useRole()

      expect(hasRole('ADMIN')).toBe(true)
    })

    it('指定したロールを持っていない場合はfalseを返す', () => {
      const store = useRoleStore()
      store.roles = [] as typeof store.roles
      const { hasRole } = useRole()

      expect(hasRole('ADMIN')).toBe(false)
    })
  })

  describe('hasAnyRole', () => {
    it('指定したロールのいずれかを持っている場合はtrueを返す', () => {
      const store = useRoleStore()
      store.roles = ['SPPRT'] as typeof store.roles
      const { hasAnyRole } = useRole()

      expect(hasAnyRole(['ADMIN', 'SPPRT'])).toBe(true)
    })

    it('指定したロールをどれも持っていない場合はfalseを返す', () => {
      const store = useRoleStore()
      store.roles = [] as typeof store.roles
      const { hasAnyRole } = useRole()

      expect(hasAnyRole(['ADMIN', 'SPPRT'])).toBe(false)
    })
  })

  describe('hasPermission', () => {
    it('指定したパーミッションを持っている場合はtrueを返す', () => {
      const store = useRoleStore()
      store.permissions = ['11'] as typeof store.permissions
      const { hasPermission } = useRole()

      expect(hasPermission('11')).toBe(true)
    })

    it('指定したパーミッションを持っていない場合はfalseを返す', () => {
      const store = useRoleStore()
      store.permissions = [] as typeof store.permissions
      const { hasPermission } = useRole()

      expect(hasPermission('11')).toBe(false)
    })
  })

  describe('isAdmin', () => {
    it('ADMINロールを持っている場合はtrueを返す', () => {
      const store = useRoleStore()
      store.roles = ['ADMIN'] as typeof store.roles
      const { isAdmin } = useRole()

      expect(isAdmin.value).toBe(true)
    })

    it('ADMINロールを持っていない場合はfalseを返す', () => {
      const store = useRoleStore()
      store.roles = ['SPPRT'] as typeof store.roles
      const { isAdmin } = useRole()

      expect(isAdmin.value).toBe(false)
    })
  })

  describe('isSupport', () => {
    it('SUPPORTロールを持っている場合はtrueを返す', () => {
      const store = useRoleStore()
      store.roles = ['SPPRT'] as typeof store.roles
      const { isSupport } = useRole()

      expect(isSupport.value).toBe(true)
    })

    it('SUPPORTロールを持っていない場合はfalseを返す', () => {
      const store = useRoleStore()
      store.roles = [] as typeof store.roles
      const { isSupport } = useRole()

      expect(isSupport.value).toBe(false)
    })
  })

  describe('canAccessAdmin', () => {
    it('ADMINロールを持っている場合はtrueを返す', () => {
      const store = useRoleStore()
      store.roles = ['ADMIN'] as typeof store.roles
      const { canAccessAdmin } = useRole()

      expect(canAccessAdmin.value).toBe(true)
    })

    it('SUPPORTロールを持っている場合もtrueを返す', () => {
      const store = useRoleStore()
      store.roles = ['SPPRT'] as typeof store.roles
      const { canAccessAdmin } = useRole()

      expect(canAccessAdmin.value).toBe(true)
    })

    it('どちらのロールも持っていない場合はfalseを返す', () => {
      const store = useRoleStore()
      store.roles = [] as typeof store.roles
      const { canAccessAdmin } = useRole()

      expect(canAccessAdmin.value).toBe(false)
    })
  })

  describe('canReplyInquiry', () => {
    it('INQUIRY_REPLYパーミッション（20）を持っている場合はtrueを返す', () => {
      const store = useRoleStore()
      store.permissions = ['20'] as typeof store.permissions
      const { canReplyInquiry } = useRole()

      expect(canReplyInquiry.value).toBe(true)
    })

    it('INQUIRY_REPLYパーミッションを持っていない場合はfalseを返す', () => {
      const store = useRoleStore()
      store.permissions = ['10', '11'] as typeof store.permissions
      const { canReplyInquiry } = useRole()

      expect(canReplyInquiry.value).toBe(false)
    })
  })
})
