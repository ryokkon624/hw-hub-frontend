import { computed } from 'vue'
import { useRoleStore } from '@/stores/roleStore'
import { USER_ROLE, PERMISSION } from '@/constants/code.constants'
import type { UserRoleCode, PermissionCode } from '@/constants/code.constants'

export function useRole() {
  const roleStore = useRoleStore()

  const hasRole = (role: UserRoleCode): boolean => roleStore.roles.includes(role)

  const hasAnyRole = (roles: UserRoleCode[]): boolean =>
    roles.some((r) => roleStore.roles.includes(r))

  const hasPermission = (permission: PermissionCode): boolean =>
    roleStore.permissions.includes(permission)

  const isAdmin = computed(() => hasRole(USER_ROLE.ADMIN))
  const isSupport = computed(() => hasRole(USER_ROLE.SUPPORT))

  /** 管理画面にアクセスできるか */
  const canAccessAdmin = computed(() => hasAnyRole([USER_ROLE.ADMIN, USER_ROLE.SUPPORT]))
  /** 問い合わせ返信ができるか */
  const canReplyInquiry = computed(() => hasPermission(PERMISSION.INQUIRY_REPLY))
  /** ロール管理ができるか */
  const canManageRole = computed(() => hasPermission(PERMISSION.ROLE_MANAGE))
  /** ユーザ管理ができるか */
  const canManageUser = computed(() => hasPermission(PERMISSION.USER_LIST_VIEW))

  return {
    hasRole,
    hasAnyRole,
    hasPermission,
    isAdmin,
    isSupport,
    canAccessAdmin,
    canReplyInquiry,
    canManageRole,
    canManageUser,
  }
}
