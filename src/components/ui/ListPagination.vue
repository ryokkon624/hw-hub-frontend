<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

const { t } = useI18n()

// 表示するページ番号を計算（省略記号付き）
const pageNumbers = computed(() => {
  const total = props.totalPages
  const current = props.currentPage
  const pages: (number | '...')[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }

  // 先頭
  pages.push(1)

  if (current > 3) {
    pages.push('...')
  }

  // 中央のウィンドウ
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push('...')
  }

  // 末尾
  pages.push(total)

  return pages
})

const isFirst = computed(() => props.currentPage <= 1)
const isLast = computed(() => props.currentPage >= props.totalPages)

const go = (page: number) => emit('update:currentPage', page)
const goPrev = () => {
  if (!isFirst.value) go(props.currentPage - 1)
}
const goNext = () => {
  if (!isLast.value) go(props.currentPage + 1)
}
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="flex items-center justify-center gap-1 py-3"
    role="navigation"
    :aria-label="t('housework.list.pagination.ariaLabel')"
  >
    <!-- 前へ -->
    <button
      type="button"
      class="rounded-md px-2.5 py-1.5 text-xs font-medium transition"
      :class="
        isFirst
          ? 'text-gray-300 cursor-not-allowed'
          : 'text-hwhub-muted hover:bg-hwhub-surface-subtle hover:text-hwhub-heading'
      "
      :disabled="isFirst"
      @click="goPrev"
    >
      {{ t('housework.list.pagination.prev') }}
    </button>

    <!-- ページ番号 -->
    <template v-for="(page, idx) in pageNumbers" :key="idx">
      <span v-if="page === '...'" class="px-1 text-xs text-gray-400 select-none"> … </span>
      <button
        v-else
        type="button"
        class="min-w-7 rounded-md px-1.5 py-1 text-xs font-medium transition"
        :class="
          page === currentPage
            ? 'bg-hwhub-primary text-white shadow-sm'
            : 'text-hwhub-muted hover:bg-hwhub-surface-subtle hover:text-hwhub-heading'
        "
        @click="go(page)"
      >
        {{ page }}
      </button>
    </template>

    <!-- 次へ -->
    <button
      type="button"
      class="rounded-md px-2.5 py-1.5 text-xs font-medium transition"
      :class="
        isLast
          ? 'text-gray-300 cursor-not-allowed'
          : 'text-hwhub-muted hover:bg-hwhub-surface-subtle hover:text-hwhub-heading'
      "
      :disabled="isLast"
      @click="goNext"
    >
      {{ t('housework.list.pagination.next') }}
    </button>
  </nav>
</template>
