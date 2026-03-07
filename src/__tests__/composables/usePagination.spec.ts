import { describe, it, expect } from 'vitest'
import { ref, nextTick } from 'vue'
import { usePagination } from '@/composables/usePagination'

describe('usePagination', () => {
  const makeItems = (n: number) => Array.from({ length: n }, (_, i) => i + 1)

  it('10件以下なら1ページのみ', () => {
    const source = ref(makeItems(5))
    const { pagedItems, totalPages, isFirstPage, isLastPage } = usePagination(source, 10)

    expect(totalPages.value).toBe(1)
    expect(pagedItems.value).toEqual([1, 2, 3, 4, 5])
    expect(isFirstPage.value).toBe(true)
    expect(isLastPage.value).toBe(true)
  })

  it('25件を10件/ページで3ページに分割する', () => {
    const source = ref(makeItems(25))
    const { pagedItems, totalPages, currentPage } = usePagination(source, 10)

    expect(totalPages.value).toBe(3)
    expect(pagedItems.value).toEqual(makeItems(10))

    currentPage.value = 2
    expect(pagedItems.value).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20])

    currentPage.value = 3
    expect(pagedItems.value).toEqual([21, 22, 23, 24, 25])
  })

  it('goNext / goPrev でページ移動できる', () => {
    const source = ref(makeItems(30))
    const { currentPage, goNext, goPrev, isFirstPage, isLastPage } = usePagination(source, 10)

    expect(currentPage.value).toBe(1)
    expect(isFirstPage.value).toBe(true)

    goNext()
    expect(currentPage.value).toBe(2)

    goNext()
    expect(currentPage.value).toBe(3)
    expect(isLastPage.value).toBe(true)

    goNext() // 最後ページを超えない
    expect(currentPage.value).toBe(3)

    goPrev()
    expect(currentPage.value).toBe(2)

    goPrev()
    expect(currentPage.value).toBe(1)
    expect(isFirstPage.value).toBe(true)

    goPrev() // 最初ページを超えない
    expect(currentPage.value).toBe(1)
  })

  it('goToPage で任意のページにジャンプできる', () => {
    const source = ref(makeItems(50))
    const { currentPage, goToPage } = usePagination(source, 10)

    goToPage(3)
    expect(currentPage.value).toBe(3)

    goToPage(0) // 下限クランプ
    expect(currentPage.value).toBe(1)

    goToPage(999) // 上限クランプ
    expect(currentPage.value).toBe(5)
  })

  it('ソースが変更されたらページが1にリセットされる', async () => {
    const source = ref(makeItems(30))
    const { currentPage, goToPage } = usePagination(source, 10)

    goToPage(3)
    expect(currentPage.value).toBe(3)

    source.value = makeItems(20)
    await nextTick()
    expect(currentPage.value).toBe(1)
  })

  it('空配列のとき totalPages は1、pagedItems は空', () => {
    const source = ref<number[]>([])
    const { totalPages, pagedItems, startIndex, endIndex, totalCount } = usePagination(source, 10)

    expect(totalPages.value).toBe(1)
    expect(pagedItems.value).toEqual([])
    expect(startIndex.value).toBe(0)
    expect(endIndex.value).toBe(0)
    expect(totalCount.value).toBe(0)
  })

  it('startIndex / endIndex / totalCount が正しい値を返す', () => {
    const source = ref(makeItems(25))
    const { startIndex, endIndex, totalCount, currentPage } = usePagination(source, 10)

    expect(startIndex.value).toBe(1)
    expect(endIndex.value).toBe(10)
    expect(totalCount.value).toBe(25)

    currentPage.value = 3
    expect(startIndex.value).toBe(21)
    expect(endIndex.value).toBe(25)
  })
})
