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
        return 'border-hwhub-border'
    }
  }

  const storeTypeCardClass = (code: string | null | undefined): string => {
    switch (code) {
      case '1': // SUPERMARKET
        return 'bg-hwhub-palette-emerald-soft border-hwhub-palette-emerald'
      case '2': // ONLINE
        return 'bg-hwhub-palette-blue-soft border-hwhub-palette-blue'
      case '3': // DRUGSTORE
        return 'bg-hwhub-palette-rose-soft border-hwhub-palette-rose'
      default:
        return 'bg-hwhub-surface-card border-hwhub-border'
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
        return 'bg-hwhub-swipe-disabled'
    }
  }

  return {
    storeTypeLabel,
    shoppingItemStatusLabel,
    storeTypeOptions,
    storeTypeBorderClass,
    storeTypeCardClass,
    storeTypeDotClass,
  }
}
