export interface ErrorResponse {
  errorCode: string
  message: string
  details?: FieldErrorDetail[]
}

export interface FieldErrorDetail {
  field: string
  message: string
}

// axios のエラーがこの形かどうか判定するヘルパー
export function isErrorResponse(data: unknown): data is ErrorResponse {
  if (!data || typeof data !== 'object') return false

  const hasErrorCode =
    'errorCode' in data && typeof (data as { errorCode: unknown }).errorCode === 'string'

  const hasMessage = 'message' in data && typeof (data as { message: unknown }).message === 'string'

  return hasErrorCode && hasMessage
}
