import { apiClient } from './client'
import type { InquirySummary, InquiryDetail, InquiryMessage, InquiryCreateInput } from '@/domain'
import type {
  InquiryCategoryCode,
  InquiryStatusCode,
  InquirySenderTypeCode,
} from '@/constants/code.constants'

export const inquiryApi = {
  /**
   * 問い合わせ一覧取得
   */
  async fetchInquiries(): Promise<InquirySummary[]> {
    const res = await apiClient.get<InquiryListDto>('/api/inquiries')
    return res.data.items.map(toInquirySummary)
  },

  /**
   * 問い合わせ詳細取得（メッセージ含む）
   * @param inquiryId 問い合わせID
   */
  async fetchInquiry(inquiryId: number): Promise<InquiryDetail> {
    const res = await apiClient.get<InquiryDetailDto>(`/api/inquiries/${inquiryId}`)
    return toInquiryDetail(res.data)
  },

  /**
   * 新規問い合わせ送信
   * @param input 入力値
   * @returns 作成された問い合わせID
   */
  async createInquiry(input: InquiryCreateInput): Promise<{ inquiryId: number }> {
    const payload: InquiryCreateRequestDto = {
      householdId: input.householdId,
      category: input.category,
      title: input.title,
      body: input.body,
    }
    const res = await apiClient.post<InquiryCreateResponse>('/api/inquiries', payload)
    return { inquiryId: res.data.inquiryId }
  },

  /**
   * 追加メッセージ送信
   * @param inquiryId 問い合わせID
   * @param body メッセージ本文
   */
  async addMessage(inquiryId: number, body: string): Promise<void> {
    const payload: InquiryMessageRequestDto = { body }
    await apiClient.post(`/api/inquiries/${inquiryId}/messages`, payload)
  },

  /**
   * 解決済みにする
   * @param inquiryId 問い合わせID
   */
  async closeInquiry(inquiryId: number): Promise<void> {
    await apiClient.post(`/api/inquiries/${inquiryId}/close`)
  },

  /**
   * スタッフ対応依頼
   * @param inquiryId 問い合わせID
   */
  async escalateToStaff(inquiryId: number): Promise<void> {
    await apiClient.post(`/api/inquiries/${inquiryId}/escalate`)
  },
}

// ---- API DTO ----------------------------------------------------

interface InquiryListDto {
  items: InquirySummaryDto[]
}

interface InquirySummaryDto {
  inquiryId: number
  category: string
  status: string
  title: string
  createdAt: string
}

interface InquiryDetailDto {
  inquiryId: number
  category: string
  status: string
  title: string
  createdAt: string
  messages: InquiryMessageDto[]
}

interface InquiryMessageDto {
  messageId: number
  seq: number
  senderType: string
  body: string
  createdAt: string
}

interface InquiryCreateResponse {
  inquiryId: number
}

interface InquiryCreateRequestDto {
  householdId: number
  category: string
  title: string
  body: string
}

interface InquiryMessageRequestDto {
  body: string
}

// ---- Mapper: DTO → Domain ----------------------------------------------------

const toInquirySummary = (dto: InquirySummaryDto): InquirySummary => ({
  inquiryId: dto.inquiryId,
  category: dto.category as InquiryCategoryCode,
  status: dto.status as InquiryStatusCode,
  title: dto.title,
  createdAt: new Date(dto.createdAt),
})

const toInquiryDetail = (dto: InquiryDetailDto): InquiryDetail => ({
  inquiryId: dto.inquiryId,
  category: dto.category as InquiryCategoryCode,
  status: dto.status as InquiryStatusCode,
  title: dto.title,
  createdAt: new Date(dto.createdAt),
  messages: dto.messages.map(toInquiryMessage),
})

const toInquiryMessage = (dto: InquiryMessageDto): InquiryMessage => ({
  messageId: dto.messageId,
  seq: dto.seq,
  senderType: dto.senderType as InquirySenderTypeCode,
  body: dto.body,
  createdAt: new Date(dto.createdAt),
})
