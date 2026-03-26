import { apiClient } from './client'
import { toInquiryDetail } from './inquiryApi'
import type { UserRoleCode } from '@/constants/code.constants'
import type {
  AdminUserModel,
  AdminInquiryModel,
  AdminInquirySearchParams,
  InquiryDetail,
  AdminUserDetailModel,
} from '@/domain'

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

  // ---- ユーザー管理 ------------------------------------------------

  /** 管理者: ユーザー一覧検索 */
  async searchAdminUsers(params: AdminUserSearchParams): Promise<AdminUserDetailModel[]> {
    const res = await apiClient.get<AdminUserDetailDto[]>('/api/admin/users/search', { params })
    return res.data.map(toAdminUserDetailModel)
  },

  /** 管理者: ユーザー登録 */
  async createAdminUser(params: AdminCreateUserParams): Promise<AdminUserDetailModel> {
    const res = await apiClient.post<AdminUserDetailDto>('/api/admin/users', params)
    return toAdminUserDetailModel(res.data)
  },

  /** 管理者: ユーザー更新 */
  async updateAdminUser(
    userId: number,
    params: AdminUpdateUserParams,
  ): Promise<AdminUserDetailModel> {
    const res = await apiClient.put<AdminUserDetailDto>(`/api/admin/users/${userId}`, params)
    return toAdminUserDetailModel(res.data)
  },
}

// ---- Response DTO ------------------------------------------------

interface AdminUserDetailDto {
  userId: number
  email: string
  authProvider: string
  displayName: string
  locale: string
  notificationEnabled: boolean
  isActive: boolean
  iconUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminUserSearchParams {
  email?: string
  isActive?: boolean
  locale?: string
}

export interface AdminCreateUserParams {
  email: string
  password: string
  displayName: string
  locale: string
}

export interface AdminUpdateUserParams {
  displayName: string
  locale: string
  password?: string
  isActive?: boolean
}

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

const toAdminUserDetailModel = (dto: AdminUserDetailDto): AdminUserDetailModel => ({
  ...dto,
  createdAt: new Date(dto.createdAt),
  updatedAt: new Date(dto.updatedAt),
})
