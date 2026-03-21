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
  householdId: number
  category: InquiryCategoryCode
  title: string
  body: string
}
