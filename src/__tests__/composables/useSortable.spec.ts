import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useSortable } from '@/composables/useSortable'

interface Item {
  name: string
  age: number | null
  score: number
}

describe('useSortable', () => {
  const makeSource = (): Item[] => [
    { name: 'チャーリー', age: 30, score: 80 },
    { name: 'アリス', age: 25, score: 95 },
    { name: 'ボブ', age: null, score: 70 },
    { name: 'デイビッド', age: 28, score: 85 },
  ]

  it('初期状態でソートキーが null ならソースをそのまま返す', () => {
    const source = ref(makeSource())
    const { sortedItems, sortKey } = useSortable(source)

    expect(sortKey.value).toBeNull()
    expect(sortedItems.value).toEqual(source.value)
  })

  it('toggleSort で asc ソートされる', () => {
    const source = ref(makeSource())
    const { sortedItems, toggleSort, sortKey, sortOrder } = useSortable(source)

    toggleSort('name')
    expect(sortKey.value).toBe('name')
    expect(sortOrder.value).toBe('asc')

    const names = sortedItems.value.map((i) => i.name)
    // ロケール比較: アリス < チャーリー < デイビッド < ボブ
    expect(names).toEqual(['アリス', 'チャーリー', 'デイビッド', 'ボブ'])
  })

  it('同一キーで toggleSort すると asc → desc に切り替わる', () => {
    const source = ref(makeSource())
    const { sortedItems, toggleSort, sortOrder } = useSortable(source)

    toggleSort('name')
    expect(sortOrder.value).toBe('asc')

    toggleSort('name')
    expect(sortOrder.value).toBe('desc')

    const names = sortedItems.value.map((i) => i.name)
    expect(names).toEqual(['ボブ', 'デイビッド', 'チャーリー', 'アリス'])
  })

  it('別キーに切り替えると asc にリセットされる', () => {
    const source = ref(makeSource())
    const { toggleSort, sortKey, sortOrder } = useSortable(source)

    toggleSort('name')
    toggleSort('name') // desc
    expect(sortOrder.value).toBe('desc')

    toggleSort('score')
    expect(sortKey.value).toBe('score')
    expect(sortOrder.value).toBe('asc')
  })

  it('数値フィールドを正しくソートする', () => {
    const source = ref(makeSource())
    const { sortedItems, toggleSort } = useSortable(source)

    toggleSort('score')
    const scores = sortedItems.value.map((i) => i.score)
    expect(scores).toEqual([70, 80, 85, 95])
  })

  it('null 値は末尾にソートされる', () => {
    const source = ref(makeSource())
    const { sortedItems, toggleSort } = useSortable(source)

    toggleSort('age')
    const ages = sortedItems.value.map((i) => i.age)
    // asc: 25, 28, 30, null
    expect(ages).toEqual([25, 28, 30, null])
  })

  it('null 値は desc でも末尾にソートされる', () => {
    const source = ref(makeSource())
    const { sortedItems, toggleSort } = useSortable(source)

    toggleSort('age')
    toggleSort('age') // desc
    const ages = sortedItems.value.map((i) => i.age)
    // desc: 30, 28, 25, null
    expect(ages).toEqual([30, 28, 25, null])
  })

  it('初期キーと初期順序を指定できる', () => {
    const source = ref(makeSource())
    const { sortKey, sortOrder, sortedItems } = useSortable(source, 'score', 'desc')

    expect(sortKey.value).toBe('score')
    expect(sortOrder.value).toBe('desc')

    const scores = sortedItems.value.map((i) => i.score)
    expect(scores).toEqual([95, 85, 80, 70])
  })
})
