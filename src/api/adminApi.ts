import { apiClient } from './client'
import { toInquiryDetail } from './inquiryApi'
import type { UserRoleCode } from '@/constants/code.constants'
import type {
  AdminUserModel,
  AdminInquiryModel,
  AdminInquirySearchParams,
  InquiryDetail,
  AdminUserDetailModel,
  InquiryStatusSummaryModel,
  DailyInquiryMessageModel,
  DailyInquiryStatusModel,
  AdminHouseworkTemplateModel,
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

  /** 日別・ステータス別問い合わせ件数（ダッシュボード用） */
  async fetchInquiryStats(days = 30): Promise<DailyInquiryStatusModel[]> {
    const res = await apiClient.get<DailyInquiryStatusDto[]>('/api/admin/inquiries/stats', {
      params: { days },
    })
    return res.data.map(toInquiryDailyStatsModel)
  },

  /** 日別・送信者タイプ別メッセージ件数（ダッシュボード用） */
  async fetchInquiryMessageStats(days = 10): Promise<DailyInquiryMessageModel[]> {
    const res = await apiClient.get<DailyInquiryMessageDto[]>(
      '/api/admin/inquiries/message-stats',
      { params: { days } },
    )
    return res.data.map(toInquiryMessageDailyStatsModel)
  },

  /** ステータス別件数サマリー（ダッシュボード用） */
  async fetchInquiryStatusSummary(): Promise<InquiryStatusSummaryModel> {
    const res = await apiClient.get<InquiryStatusSummaryDto>('/api/admin/inquiries/status-summary')
    return toInquiryStatusSummaryModel(res.data)
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

  // ---- 家事テンプレート管理 ----------------------------------------

  async fetchAdminHouseworkTemplates(): Promise<AdminHouseworkTemplateModel[]> {
    const res = await apiClient.get<AdminHouseworkTemplateDto[]>('/api/admin/housework-templates')
    return res.data.map(toAdminHouseworkTemplateModel)
  },

  async createAdminHouseworkTemplate(
    req: AdminHouseworkTemplateRequest,
  ): Promise<AdminHouseworkTemplateModel> {
    const res = await apiClient.post<AdminHouseworkTemplateDto>(
      '/api/admin/housework-templates',
      req,
    )
    return toAdminHouseworkTemplateModel(res.data)
  },

  async updateAdminHouseworkTemplate(
    id: number,
    req: AdminHouseworkTemplateRequest,
  ): Promise<void> {
    await apiClient.put(`/api/admin/housework-templates/${id}`, req)
  },

  async deleteAdminHouseworkTemplate(id: number): Promise<void> {
    await apiClient.delete(`/api/admin/housework-templates/${id}`)
  },
}

// ---- Response DTO ------------------------------------------------

interface InquiryStatusSummaryDto {
  open: number
  aiAnswered: number
  pendingStaff: number
  staffAnswered: number
  recentUnclosed: number
}
interface DailyInquiryMessageDto {
  date: string
  user: number
  ai: number
  staff: number
}

interface DailyInquiryStatusDto {
  date: string
  open: number
  aiAnswered: number
  pendingStaff: number
  staffAnswered: number
  closed: number
}

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

interface AdminHouseworkTemplateDto {
  houseworkTemplateId: number
  nameJa: string
  nameEn: string
  nameEs: string
  descriptionJa: string | null
  descriptionEn: string | null
  descriptionEs: string | null
  recommendationJa: string | null
  recommendationEn: string | null
  recommendationEs: string | null
  category: string
  recurrenceType: string
  weeklyDays: number | null
  dayOfMonth: number | null
  nthWeek: string | null
  weekday: string | null
}

export interface AdminHouseworkTemplateRequest {
  nameJa: string
  nameEn: string
  nameEs: string
  descriptionJa: string | null
  descriptionEn: string | null
  descriptionEs: string | null
  recommendationJa: string | null
  recommendationEn: string | null
  recommendationEs: string | null
  category: string
  recurrenceType: string
  weeklyDays: number | null
  dayOfMonth: number | null
  nthWeek: string | null
  weekday: string | null
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

const toInquiryDailyStatsModel = (dto: DailyInquiryStatusDto): DailyInquiryStatusModel => ({
  date: dto.date,
  open: dto.open,
  aiAnswered: dto.aiAnswered,
  pendingStaff: dto.pendingStaff,
  staffAnswered: dto.staffAnswered,
  closed: dto.closed,
})

const toInquiryMessageDailyStatsModel = (
  dto: DailyInquiryMessageDto,
): DailyInquiryMessageModel => ({
  date: dto.date,
  user: dto.user,
  ai: dto.ai,
  staff: dto.staff,
})

const toInquiryStatusSummaryModel = (dto: InquiryStatusSummaryDto): InquiryStatusSummaryModel => ({
  open: dto.open,
  aiAnswered: dto.aiAnswered,
  pendingStaff: dto.pendingStaff,
  staffAnswered: dto.staffAnswered,
  recentUnclosed: dto.recentUnclosed,
})

const toAdminHouseworkTemplateModel = (
  dto: AdminHouseworkTemplateDto,
): AdminHouseworkTemplateModel => ({
  houseworkTemplateId: dto.houseworkTemplateId,
  nameJa: dto.nameJa,
  nameEn: dto.nameEn,
  nameEs: dto.nameEs,
  descriptionJa: dto.descriptionJa,
  descriptionEn: dto.descriptionEn,
  descriptionEs: dto.descriptionEs,
  recommendationJa: dto.recommendationJa,
  recommendationEn: dto.recommendationEn,
  recommendationEs: dto.recommendationEs,
  category: dto.category,
  recurrenceType: dto.recurrenceType,
  weeklyDays: dto.weeklyDays,
  dayOfMonth: dto.dayOfMonth,
  nthWeek: dto.nthWeek,
  weekday: dto.weekday,
})
