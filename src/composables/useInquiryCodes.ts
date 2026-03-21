import { useCodes } from './useCodes'
import { CODE_TYPE } from '@/constants/code.constants'

export function useInquiryCodes() {
  const { labelOf, optionsOf } = useCodes()

  const categoryLabel = (v: string | number | null | undefined) =>
    labelOf(CODE_TYPE.INQUIRY_CATEGORY, v)
  const statusLabel = (v: string | number | null | undefined) =>
    labelOf(CODE_TYPE.INQUIRY_STATUS, v)
  const senderTypeLabel = (v: string | number | null | undefined) =>
    labelOf(CODE_TYPE.INQUIRY_SENDER_TYPE, v)

  const categoryOptions = optionsOf(CODE_TYPE.INQUIRY_CATEGORY)

  return {
    categoryLabel,
    statusLabel,
    senderTypeLabel,
    categoryOptions,
  }
}
