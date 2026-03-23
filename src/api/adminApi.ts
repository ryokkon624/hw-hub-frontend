import { apiClient } from './client'
import { toInquiryDetail } from './inquiryApi'
import type { UserRoleCode } from '@/constants/code.constants'
import type { AdminUserModel, AdminInquiryModel, AdminInquirySearchParams, InquiryDetail } from '@/domain'

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

  /** 対応待ち問い合わせ一覧 */
  async fetchPendingInquiries(): Promise<AdminInquiryModel[]> {
    const res = await apiClient.get<AdminInquiryDto[]>('/api/admin/inquiries')
    return res.data.map(toAdminInquiryModel)
  },

  /** 全件検索 */
  async searchInquiries(params: AdminInquirySearchParams): Promise<AdminInquiryModel[]> {
    const res = await apiClient.get<AdminInquiryDto[]>('/api/admin/inquiries/search', { params })
    return res.data.map(toAdminInquiryModel)
  },

  /** 詳細取得（管理者用） */
  async fetchAdminInquiryDetail(inquiryId: number): Promise<InquiryDetail> {
    const res = await apiClient.get(`/api/admin/inquiries/${inquiryId}`)
    return toInquiryDetail(res.data)
  },

  /** スタッフ返信 */
  async replyToInquiry(inquiryId: number, body: string): Promise<void> {
    await apiClient.post(`/api/admin/inquiries/${inquiryId}/reply`, { body })
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

interface AdminInquiryDto {
  inquiryId: number
  userId: number
  userEmail: string
  userDisplayName: string
  category: string
  status: string
  title: string
  createdAt: string
  updatedAt: string
  totalMessageCount: number
  userMessageCount: number
  aiMessageCount: number
  staffMessageCount: number
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

const toAdminInquiryModel = (dto: AdminInquiryDto): AdminInquiryModel => ({
  ...dto,
  createdAt: new Date(dto.createdAt),
  updatedAt: new Date(dto.updatedAt),
})
