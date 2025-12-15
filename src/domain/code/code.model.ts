export type CodeType = string // 例: "0001"
export type CodeValue = string // 例: "1" など

/**
 * コードマスタ Domain Model
 */
export interface CodeModel {
  codeType: CodeType
  codeTypeName: string | null
  codeTypeNameEn: string | null
  codeValue: CodeValue
  name: string
  displayNameJa: string | null
  displayNameEn: string | null
  displayNameEs: string | null
  remarks: string | null
  displayOrder: string | null
}

/**
 * ロケールに応じて表示名を返す。
 * @param code コードマスタDomain Model
 * @param locale ロケール
 * @returns ロケールに応じた表示名
 */
export const resolveCodeLabel = (code: CodeModel, locale: string): string => {
  switch (locale) {
    case 'ja':
      return code.displayNameJa ?? code.name
    case 'es':
      return code.displayNameEs ?? code.displayNameEn ?? code.name
    case 'en':
    default:
      return code.displayNameEn ?? code.name
  }
}
