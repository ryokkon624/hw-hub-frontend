import type {
  InquiryCategoryCode,
  InquiryStatusCode,
  InquirySenderTypeCode,
} from '@/constants/code.constants'

/** 問い合わせ一覧用（バックエンドの InquirySummary に対応） */
export interface InquirySummary {
  inquiryId: number
  category: InquiryCategoryCode
  status: InquiryStatusCode
  title: string
  createdAt: Date
}

/** 問い合わせ詳細用（バックエンドの InquiryDetailResponse に対応） */
export interface InquiryDetail {
  inquiryId: number
  category: InquiryCategoryCode
  status: InquiryStatusCode
  title: string
  createdAt: Date
  messages: InquiryMessage[]
}

/** メッセージ */
export interface InquiryMessage {
  messageId: number
  seq: number
  senderType: InquirySenderTypeCode
  body: string
  createdAt: Date
}

/** 新規作成の入力値 */
export interface InquiryCreateInput {
  category: InquiryCategoryCode
  title: string
  body: string
}

/** 管理用問い合わせ一覧用 */
export interface AdminInquiryModel {
  inquiryId: number
  userId: number
  userEmail: string
  userDisplayName: string
  category: string
  status: string
  title: string
  createdAt: Date
  updatedAt: Date
  totalMessageCount: number
  userMessageCount: number
  aiMessageCount: number
  staffMessageCount: number
}

/** 管理用問い合わせ検索条件 */
export interface AdminInquirySearchParams {
  createdAtFrom?: string
  createdAtTo?: string
  updatedAtFrom?: string
  updatedAtTo?: string
  userId?: number
  category?: string
  status?: string
}

/** 問い合わせ状況 */
export interface InquiryStatusSummaryModel {
  open: number
  aiAnswered: number
  pendingStaff: number
  staffAnswered: number
  recentUnclosed: number
}

/** 問い合わせメッセージ日次集計 */
export interface DailyInquiryMessageModel {
  date: string
  user: number
  ai: number
  staff: number
}

/** 問い合わせ日次集計 */
export interface DailyInquiryStatusModel {
  date: string
  open: number
  aiAnswered: number
  pendingStaff: number
  staffAnswered: number
  closed: number
}
