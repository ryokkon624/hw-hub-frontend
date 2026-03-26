<template>
  <BaseModal :title="t('shopping.favoriteModal.title')" @close="$emit('close')">
    <div class="flex justify-between items-center mb-2">
      <p class="text-xs text-hwhub-muted">{{ t('shopping.favoriteModal.description') }}</p>
      <button
        type="button"
        class="text-[11px] text-hwhub-muted hover:text-hwhub-heading underline"
        @click="reload"
      >
        {{ t('shopping.favoriteModal.reload') }}
      </button>
    </div>

    <!-- フィルタ UI -->
    <div class="mb-3 space-y-2">
      <!-- 品名検索 -->
      <input
        v-model="keyword"
        type="text"
        class="w-full rounded-md border border-hwhub-border-subtle px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary"
        :placeholder="t('shopping.favoriteModal.filters.keywordPlaceholder')"
      />

      <!-- 購入場所 -->
      <ShoppingStoreTypeFilter v-model="storeTypeFilter" />
    </div>

    <div v-if="loading" class="py-8 text-center text-xs text-hwhub-muted">
      {{ t('shopping.favoriteModal.loading') }}
    </div>

    <!-- 履歴そのものがゼロ -->
    <div v-else-if="rawFavorites.length === 0" class="py-8 text-center text-xs text-hwhub-muted">
      {{ t('shopping.favoriteModal.emptyAll') }}
    </div>

    <!-- 履歴はあるが、条件にマッチしない -->
    <div v-else-if="favorites.length === 0" class="py-8 text-center text-xs text-hwhub-muted">
      {{ t('shopping.favoriteModal.emptyFiltered') }}
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="item in favorites"
        :key="item.shoppingItemId"
        class="border bg-white rounded-lg px-3 py-2 text-xs flex gap-2 items-center hover:bg-hwhub-surface-subtle cursor-pointer transition shadow-sm hover:shadow-md hover:-translate-y-px"
        :class="storeTypeBorderClass(item.storeType)"
        @click="onSelect(item)"
      >
        <!-- サムネ -->
        <div
          class="flex items-center justify-center h-8 w-8 rounded bg-hwhub-surface-subtle text-[10px] text-hwhub-muted shrink-0"
        >
          <span v-if="item.hasImage">{{
            t('shopping.favoriteModal.item.thumbnail.hasImage')
          }}</span>
          <span v-else>{{ t('shopping.favoriteModal.item.thumbnail.noImage') }}</span>
        </div>

        <div class="flex-1 min-w-0">
          <p class="font-medium truncate text-sm text-hwhub-heading">{{ item.name }}</p>
          <p class="text-[11px] text-hwhub-muted truncate">
            {{ storeTypeLabel(item.storeType) || t('shopping.favoriteModal.item.storeTypeUnset') }}
            <span v-if="item.memo"
              >{{ t('shopping.favoriteModal.item.memoPrefix') }}{{ item.memo }}</span
            >
          </p>
        </div>

        <button
          type="button"
          class="text-[11px] px-2 py-1 rounded-full border border-hwhub-border-subtle text-hwhub-heading hover:bg-hwhub-surface-subtle"
        >
          {{ t('shopping.favoriteModal.item.selectButton') }}
        </button>
      </li>
    </ul>
  </BaseModal>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import ShoppingStoreTypeFilter from '@/components/shopping/ShoppingStoreTypeFilter.vue'
import { useShoppingFavoriteStore } from '@/stores/shoppingFavoriteStore'
import type { ShoppingItemModel } from '@/domain'
import { useShoppingCodes } from '@/composables/useShoppingCodes'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  householdId: number
}>()

const emit = defineEmits<{
  close: []
  selected: [item: ShoppingItemModel]
}>()

const favoriteStore = useShoppingFavoriteStore()
const { storeTypeLabel, storeTypeBorderClass } = useShoppingCodes()

// 元データ（Store からのそのまま）
const rawFavorites = computed<ShoppingItemModel[]>(() => {
  if (!props.householdId) return []
  return favoriteStore.favorites(props.householdId)
})

const loading = ref(false)

// フィルタ用 state
const keyword = ref('')
const storeTypeFilter = ref<'all' | '1' | '2' | '3'>('all')

// 絞り込み後のリスト
const favorites = computed<ShoppingItemModel[]>(() => {
  let list = rawFavorites.value

  // 品名テキスト検索
  if (keyword.value.trim()) {
    const kw = keyword.value.trim().toLowerCase()
    list = list.filter((h) => h.name.toLowerCase().includes(kw))
  }

  // 購入場所フィルタ
  if (storeTypeFilter.value !== 'all') {
    list = list.filter((h) => h.storeType === storeTypeFilter.value)
  }

  return list
})

const load = async () => {
  loading.value = true
  try {
    await favoriteStore.fetchFavorites(props.householdId)
  } finally {
    loading.value = false
  }
}

const reload = () => load()

const onSelect = (item: ShoppingItemModel) => {
  emit('selected', item)
  emit('close')
}

onMounted(load)
</script>
