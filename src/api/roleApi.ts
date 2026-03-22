import { apiClient } from './client'
import type { UserRoleCode, PermissionCode } from '@/constants/code.constants'
import type { MyRolesModel } from '@/domain'

// ---- API クライアント --------------------------------------------

export const roleApi = {
  /** ログインユーザーのロール・パーミッション取得 */
  async fetchMyRoles(): Promise<MyRolesModel> {
    const res = await apiClient.get<MyRolesResponse>('/api/users/me/roles')
    return toMyRolesModel(res.data)
  },

  /** ユーザーにロールを付与（ROLE_MANAGE パーミッション必須） */
  async assignRole(userId: number, role: UserRoleCode): Promise<void> {
    await apiClient.post(`/api/admin/roles/${userId}`, { role })
  },

  /** ユーザーからロールを削除（ROLE_MANAGE パーミッション必須） */
  async removeRole(userId: number, role: UserRoleCode): Promise<void> {
    await apiClient.delete(`/api/admin/roles/${userId}/${role}`)
  },
}

// ---- Response DTO ------------------------------------------------

interface MyRolesResponse {
  roles: string[]
  permissions: string[]
}

// ---- Mapper ------------------------------------------------------

const toMyRolesModel = (dto: MyRolesResponse): MyRolesModel => ({
  roles: dto.roles as UserRoleCode[],
  permissions: dto.permissions as PermissionCode[],
})
