import { ref, computed, watch, type Ref } from 'vue'

/**
 * クライアントサイドのページネーション composable
 *
 * @param source - ページング対象の配列 (Ref)
 * @param perPage - 1ページあたりの件数 (デフォルト10)
 */
export function usePagination<T>(source: Ref<T[]>, perPage: number = 10) {
  const currentPage = ref(1)

  const totalPages = computed(() => Math.max(1, Math.ceil(source.value.length / perPage)))

  // ソースが変わったらページを1にリセット
  watch(source, () => {
    currentPage.value = 1
  })

  const pagedItems = computed(() => {
    const start = (currentPage.value - 1) * perPage
    return source.value.slice(start, start + perPage)
  })

  const isFirstPage = computed(() => currentPage.value <= 1)
  const isLastPage = computed(() => currentPage.value >= totalPages.value)

  // 表示範囲（1-indexed）
  const startIndex = computed(() =>
    source.value.length === 0 ? 0 : (currentPage.value - 1) * perPage + 1,
  )
  const endIndex = computed(() =>
    Math.min(currentPage.value * perPage, source.value.length),
  )
  const totalCount = computed(() => source.value.length)

  const goToPage = (page: number) => {
    const p = Math.max(1, Math.min(page, totalPages.value))
    currentPage.value = p
  }

  const goNext = () => {
    if (!isLastPage.value) currentPage.value++
  }

  const goPrev = () => {
    if (!isFirstPage.value) currentPage.value--
  }

  return {
    currentPage,
    totalPages,
    pagedItems,
    isFirstPage,
    isLastPage,
    startIndex,
    endIndex,
    totalCount,
    goToPage,
    goNext,
    goPrev,
  }
}
