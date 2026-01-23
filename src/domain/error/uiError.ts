/**
 * UI が扱うためのエラー情報。
 * - messageKey は i18n のキー（例: errors.common.network）
 * - details はフィールド単位のエラー（必要になったら表示）
 */
export interface UiError {
  messageKey: string
  details?: { field: string; messageKey: string }[]
}
