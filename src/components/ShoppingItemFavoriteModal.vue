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
        class="w-full rounded-md border border-hwhub-border-subtle px-2 py-1 text-xs bg-hwhub-surface-card focus:outline-none focus:ring-1 focus:ring-hwhub-primary"
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
        class="group rounded-xl border px-3 py-2.5 flex items-start gap-3 hover:bg-hwhub-surface shadow-sm hover:shadow-md hover:-translate-y-px transition cursor-pointer"
        :class="storeTypeCardClass(item.storeType)"
        @click="onSelect(item)"
      >
        <!-- テキスト＆メイン情報 -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2 min-w-0">
            <!-- 左：タイトル＋メモ -->
            <div class="flex-1 min-w-0 flex flex-col justify-center min-h-10">
              <p
                class="text-[13px] font-semibold leading-snug line-clamp-2 group-hover:text-hwhub-heading transition-colors"
              >
                {{ item.name }}
              </p>
              <p v-if="item.memo" class="mt-0.5 text-[11px] text-hwhub-muted leading-snug truncate">
                {{ item.memo }}
              </p>
              <p class="mt-0.5 text-[10px] text-hwhub-muted/80 leading-snug truncate">
                {{
                  storeTypeLabel(item.storeType) || t('shopping.favoriteModal.item.storeTypeUnset')
                }}
              </p>
            </div>

            <!-- 右上：画像アイコン（あるときだけ） -->
            <div v-if="item.hasImage" class="shrink-0 ml-1 mt-0.5">
              <span
                class="inline-flex items-center justify-center h-5 w-5 rounded-full bg-hwhub-surface-subtle text-hwhub-muted"
              >
                <Camera class="w-3 h-3 text-hwhub-muted" />
              </span>
            </div>

            <!-- 右：アクション -->
            <div class="flex flex-col justify-center items-center shrink-0 min-h-10 min-w-[56px]">
              <span class="text-[11px] font-medium text-hwhub-primary">{{
                t('shopping.favoriteModal.item.selectButton')
              }}</span>
            </div>
          </div>
        </div>
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
import { Camera } from 'lucide-vue-next'
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
const { storeTypeLabel, storeTypeCardClass } = useShoppingCodes()

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
