import type { CodeModel } from '@/domain'
import { apiClient } from './client'

export const codeApi = {
  /**
   * コードマスタを取得する。
   * @returns コードマスタDomain Model配列
   */
  async fetchAllCodes(): Promise<CodeModel[]> {
    const res = await apiClient.get<CodesResponse>('/api/codes')

    if (Array.isArray(res.data.codes)) {
      return res.data.codes.map(toModel)
    }

    return []
  },
}

// ---- API DTO ----------------------------------------------------

type CodesResponse = {
  codes: CodeDto[]
}

/**
 * Response用のコードマスタのDTO
 */
interface CodeDto {
  codeType: string
  codeTypeName: string | null
  codeTypeNameEn: string | null
  codeValue: string
  name: string
  displayNameJa: string | null
  displayNameEn: string | null
  displayNameEs: string | null
  remarks: string | null
  displayOrder: string | null
}

// ---- Mapper: DTO ⇔ Domain ----------------------------------------------------

/**
 * Response DTO → Domain Modelへの変換
 * @param dto Response DTO
 * @returns Domain Model
 */
const toModel = (dto: CodeDto): CodeModel => ({
  codeType: dto.codeType,
  codeTypeName: dto.codeTypeName,
  codeTypeNameEn: dto.codeTypeNameEn,
  codeValue: dto.codeValue,
  name: dto.name,
  displayNameJa: dto.displayNameJa,
  displayNameEn: dto.displayNameEn,
  displayNameEs: dto.displayNameEs,
  remarks: dto.remarks,
  displayOrder: dto.displayOrder,
})
