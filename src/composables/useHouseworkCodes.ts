import { useCodes } from './useCodes'
import { CODE_TYPE } from '@/constants/code.constants'

export function useHouseworkCodes() {
  const { labelOf, optionsOf } = useCodes()

  const recurrenceTypeLabel = (v: string | number | null | undefined) =>
    labelOf(CODE_TYPE.RECURRENCE_TYPE, v)
  const categoryLabel = (v: string | number | null | undefined) => labelOf(CODE_TYPE.CATEGORY, v)
  const weekdayLabel = (v: string | number | null | undefined) => labelOf(CODE_TYPE.WEEKDAY, v)
  const nthWeekLabel = (v: string | number | null | undefined) => labelOf(CODE_TYPE.NTH_WEEK, v)

  const recurrenceTypeOptions = optionsOf(CODE_TYPE.RECURRENCE_TYPE)
  const categoryOptions = optionsOf(CODE_TYPE.CATEGORY)
  const weekdayOptions = optionsOf(CODE_TYPE.WEEKDAY)
  const nthWeekOptions = optionsOf(CODE_TYPE.NTH_WEEK)

  return {
    recurrenceTypeLabel,
    categoryLabel,
    weekdayLabel,
    nthWeekLabel,
    recurrenceTypeOptions,
    categoryOptions,
    weekdayOptions,
    nthWeekOptions,
  }
}
