import { useCodes } from './useCodes'
import { CODE_TYPE } from '@/constants/code.constants'

export function useShoppingCodes() {
  const { labelOf, optionsOf } = useCodes()

  const storeTypeLabel = (v: string | number | null | undefined) =>
    labelOf(CODE_TYPE.PURCHASE_LOCATION_TYPE, v)
  const shoppingItemStatusLabel = (v: string | number | null | undefined) =>
    labelOf(CODE_TYPE.SHOPPING_ITEM_STATUS, v)

  const storeTypeOptions = optionsOf(CODE_TYPE.PURCHASE_LOCATION_TYPE)

  return {
    storeTypeLabel,
    shoppingItemStatusLabel,
    storeTypeOptions,
  }
}
