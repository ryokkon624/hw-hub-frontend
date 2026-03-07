import { ref, computed, type Ref } from 'vue'

export type SortOrder = 'asc' | 'desc'

/**
 * クライアントサイドの列ソート composable
 *
 * @param source - ソート対象の配列 (Ref)
 * @param initialKey - 初期ソートキー
 * @param initialOrder - 初期ソート順（デフォルト: 'asc'）
 */
export function useSortable<T>(
  source: Ref<T[]>,
  initialKey: keyof T | null = null,
  initialOrder: SortOrder = 'asc',
) {
  const sortKey = ref<keyof T | null>(initialKey) as Ref<keyof T | null>
  const sortOrder = ref<SortOrder>(initialOrder)

  const sortedItems = computed(() => {
    const key = sortKey.value
    if (!key) return source.value

    const order = sortOrder.value === 'asc' ? 1 : -1
    return [...source.value].sort((a, b) => {
      const va = a[key]
      const vb = b[key]

      // null / undefined は末尾
      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1

      // 文字列はロケール比較
      if (typeof va === 'string' && typeof vb === 'string') {
        return va.localeCompare(vb) * order
      }

      // 数値・その他
      if (va < vb) return -1 * order
      if (va > vb) return 1 * order
      return 0
    })
  })

  /**
   * 同一キーなら asc ↔ desc 切り替え、別キーなら asc でリセット
   */
  const toggleSort = (key: keyof T) => {
    if (sortKey.value === key) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortOrder.value = 'asc'
    }
  }

  return {
    sortKey,
    sortOrder,
    sortedItems,
    toggleSort,
  }
}
