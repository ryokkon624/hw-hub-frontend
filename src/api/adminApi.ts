import { apiClient } from './client'
import type { UserRoleCode } from '@/constants/code.constants'
import type { AdminUserModel } from '@/domain'

// ---- API クライアント --------------------------------------------

export const adminApi = {
  /** メールアドレスでユーザー検索 */
  async searchUsers(email: string): Promise<AdminUserModel[]> {
    const res = await apiClient.get<AdminUserDto[]>('/api/admin/users', {
      params: { email },
    })
    return res.data.map(toAdminUserModel)
  },

  /** ロール付与 */
  async assignRole(userId: number, role: UserRoleCode): Promise<void> {
    await apiClient.post(`/api/admin/roles/${userId}`, { role })
  },

  /** ロール削除 */
  async removeRole(userId: number, role: UserRoleCode): Promise<void> {
    await apiClient.delete(`/api/admin/roles/${userId}/${role}`)
  },
}

// ---- Response DTO ------------------------------------------------
interface AdminUserDto {
  userId: number
  email: string
  displayName: string
  locale: string
  isActive: boolean
  roles: string[]
}

// ---- Mapper ------------------------------------------------------
const toAdminUserModel = (dto: AdminUserDto): AdminUserModel => ({
  userId: dto.userId,
  email: dto.email,
  displayName: dto.displayName,
  locale: dto.locale,
  isActive: dto.isActive,
  roles: dto.roles as UserRoleCode[],
})
