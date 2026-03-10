import { useCodes } from './useCodes'
import { CODE_TYPE } from '@/constants/code.constants'

export function useShoppingCodes() {
  const { labelOf, optionsOf } = useCodes()

  const storeTypeLabel = (v: string | number | null | undefined) =>
    labelOf(CODE_TYPE.PURCHASE_LOCATION_TYPE, v)
  const shoppingItemStatusLabel = (v: string | number | null | undefined) =>
    labelOf(CODE_TYPE.SHOPPING_ITEM_STATUS, v)

  const storeTypeOptions = optionsOf(CODE_TYPE.PURCHASE_LOCATION_TYPE)

  const storeTypeBorderClass = (code: string | null | undefined): string => {
    switch (code) {
      case '1': // SUPERMARKET
        return 'border-hwhub-store-super'
      case '2': // ONLINE
        return 'border-hwhub-store-online'
      case '3': // DRUGSTORE
        return 'border-hwhub-store-drug'
      default:
        return 'border-gray-300'
    }
  }

  const storeTypeDotClass = (code: string | null | undefined): string => {
    switch (code) {
      case '1':
        return 'bg-hwhub-store-super'
      case '2':
        return 'bg-hwhub-store-online'
      case '3':
        return 'bg-hwhub-store-drug'
      default:
        return 'bg-gray-300'
    }
  }

  return {
    storeTypeLabel,
    shoppingItemStatusLabel,
    storeTypeOptions,
    storeTypeBorderClass,
    storeTypeDotClass,
  }
}
