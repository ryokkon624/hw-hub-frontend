<template>
  <div class="space-y-4">
    <!-- タイトル -->
    <header class="flex items-center justify-between">
      <div>
        <h1 class="sr-only">{{ t('shopping.create.titleSr') }}</h1>
        <p class="text-sm text-hwhub-muted">{{ t('shopping.create.intro') }}</p>
      </div>
    </header>

    <!-- PC用ボタンエリア -->
    <div class="hidden sm:flex items-center gap-2">
      <button
        type="button"
        class="inline-flex items-center rounded-full bg-hwhub-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-hwhub-primary"
        @click="openHistoryModal"
      >
        {{ t('shopping.create.historyButton') }}
      </button>

      <button
        type="button"
        class="inline-flex items-center rounded-full bg-hwhub-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-hwhub-primary"
        @click="openFavoriteModal"
      >
        {{ t('shopping.create.favoriteButton') }}
      </button>
    </div>

    <!-- SP用ボタンエリア -->
    <div class="sm:hidden space-y-2">
      <button
        type="button"
        class="w-full rounded-full bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:bg-hwhub-primary"
        @click="openHistoryModal"
      >
        {{ t('shopping.create.historyButton') }}
      </button>

      <button
        type="button"
        class="w-full rounded-full bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:bg-hwhub-primary"
        @click="openFavoriteModal"
      >
        {{ t('shopping.create.favoriteButton') }}
      </button>
    </div>

    <form class="space-y-4 max-w-xl" @submit.prevent="onSubmit">
      <!-- 品名 -->
      <div>
        <label class="block text-sm font-medium mb-1 text-hwhub-heading" for="name">
          {{ t('shopping.create.fields.name') }}
        </label>
        <input
          id="name"
          v-model="name"
          type="text"
          class="w-full rounded-lg border border-hwhub-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          maxlength="100"
          required
        />
      </div>

      <!-- メモ -->
      <div>
        <label class="block text-sm font-medium mb-1 text-hwhub-heading" for="memo">
          {{ t('shopping.create.fields.memo') }}
        </label>
        <textarea
          id="memo"
          v-model="memo"
          class="w-full rounded-lg border border-hwhub-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          rows="3"
          maxlength="255"
        />
      </div>

      <!-- 購入場所 -->
      <div>
        <label class="block text-sm font-medium mb-1 text-hwhub-heading" for="storeType">
          {{ t('shopping.create.fields.storeType') }}
        </label>
        <select
          id="storeType"
          v-model="storeType"
          class="w-full rounded-lg border border-hwhub-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          required
        >
          <option value="" disabled>{{ t('common.selectPlaceholder') }}</option>
          <option v-for="opt in storeTypeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- お気に入り -->
      <div class="flex items-center gap-2">
        <input
          id="favorite"
          v-model="favorite"
          type="checkbox"
          :disabled="isFavoriteFixed"
          class="h-4 w-4 rounded border-hwhub-border text-hwhub-primary focus:ring-hwhub-primary focus:ring-offset-0 disabled:opacity-50"
        />
        <label
          for="favorite"
          class="text-sm text-hwhub-heading"
          :class="{ 'opacity-50': isFavoriteFixed }"
        >
          {{ t('shopping.create.fields.favorite') }}
        </label>
      </div>

      <ImageFileInput
        :label="t('shopping.create.image.label')"
        :description="t('shopping.create.image.description')"
        :maxSizeBytes="5 * 1024 * 1024"
        :rightHint="t('shopping.create.image.rightHint')"
        @change="onFileChange"
        @error="onFileError"
      />

      <!-- ボタン -->
      <div class="flex items-center gap-2">
        <button
          type="submit"
          class="inline-flex items-center rounded-full bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:bg-hwhub-primary disabled:opacity-50"
          :disabled="!canSubmit"
        >
          {{ t('shopping.create.buttons.submit') }}
        </button>

        <button
          type="button"
          class="text-sm text-hwhub-muted hover:text-hwhub-heading"
          @click="onCancel"
        >
          {{ t('shopping.create.buttons.cancel') }}
        </button>
      </div>
    </form>
  </div>

  <ShoppingItemHistoryModal
    v-if="showHistoryModal && currentHouseholdId"
    :household-id="currentHouseholdId"
    @close="closeHistoryModal"
    @selected="onHistorySelected"
  />

  <ShoppingItemFavoriteModal
    v-if="showFavoriteModal && currentHouseholdId"
    :household-id="currentHouseholdId"
    @close="closeFavoriteModal"
    @selected="onFavoriteSelected"
  />
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHouseholdStore } from '@/stores/householdStore'
import { useShoppingStore } from '@/stores/shoppingStore'
import { useUiStore } from '@/stores/uiStore'
import { useCodeStore } from '@/stores/codeStore' // 購入場所（0010）用
import { useShoppingItemAttachmentStore } from '@/stores/shoppingItemAttachmentStore'
import { useShoppingHistoryStore } from '@/stores/shoppingHistoryStore'
import type {
  ShoppingItemHistorySuggestionModel,
  ShoppingItemCreateInput,
  ShoppingItemModel,
} from '@/domain'
import ShoppingItemHistoryModal from '@/components/ShoppingItemHistoryModal.vue'
import ShoppingItemFavoriteModal from '@/components/ShoppingItemFavoriteModal.vue'
import ImageFileInput from '@/components/inputs/ImageFileInput.vue'
import { useShoppingCodes } from '@/composables/useShoppingCodes'
import type { PurchaseLocationTypeCode } from '@/constants/code.constants'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const householdStore = useHouseholdStore()
const shoppingStore = useShoppingStore()
const uiStore = useUiStore()
const codeStore = useCodeStore()
const attachmentStore = useShoppingItemAttachmentStore()
const historyStore = useShoppingHistoryStore()
const { storeTypeOptions } = useShoppingCodes()

const currentHouseholdId = computed(() => householdStore.currentHouseholdId ?? null)

// フォーム項目
const name = ref('')
const memo = ref<string | null>('')
const storeType = ref<PurchaseLocationTypeCode | ''>('')
const favorite = ref(false)
const isFavoriteFixed = ref(false)
const selectedFile = ref<File | null>(null)
const selectedSourceShoppingItemId = ref<number | null>(null)

const canSubmit = computed(() => {
  return !!currentHouseholdId.value && name.value.trim().length > 0 && storeType.value !== ''
})

onMounted(async () => {
  await codeStore.loadAllIfNeeded()
  if (currentHouseholdId.value) {
    try {
      await historyStore.fetchSuggestions(currentHouseholdId.value, { limit: 20 })
    } catch (e) {
      // 無視してもOK
      console.error(e)
    }
  }
})

const onSubmit = async () => {
  if (!currentHouseholdId.value) {
    uiStore.showToast('error', t('shopping.create.messages.householdNotSelected'))
    return
  }
  if (!canSubmit.value) {
    uiStore.showToast('error', t('shopping.create.messages.invalidInput'))
    return
  }

  const storeTypeValue = storeType.value
  if (!storeTypeValue) {
    uiStore.showToast('error', t('shopping.create.messages.storeTypeRequired'))
    return
  }

  const payload: ShoppingItemCreateInput = {
    name: name.value.trim(),
    memo: memo.value?.trim() || null,
    storeType: storeTypeValue,
    favorite: favorite.value,
    sourceShoppingItemId: selectedSourceShoppingItemId.value ?? null,
  }

  try {
    await uiStore.withLoading(async () => {
      const created = await shoppingStore.addItem(currentHouseholdId.value!, payload)

      // ファイルが選ばれていれば添付をアップロード
      if (selectedFile.value) {
        await attachmentStore.uploadAttachment(created.shoppingItemId, selectedFile.value)
      }
      await shoppingStore.fetchItems(currentHouseholdId.value!, { force: true })
    })

    uiStore.showToast('success', t('shopping.create.messages.createSuccess'))
    router.push('/shopping')
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', t('shopping.create.messages.createError'))
  }
}

const onCancel = () => {
  router.back()
}

const onFileChange = (files: File[] | null) => {
  if (!files || files.length === 0) {
    selectedFile.value = null
    return
  }
  if (files[0]) selectedFile.value = files[0]
}

const onFileError = (message: string) => {
  uiStore.showToast('error', message)
}

// モーダル関連
const showHistoryModal = ref(false)

const openHistoryModal = () => {
  showHistoryModal.value = true
}

const closeHistoryModal = () => {
  showHistoryModal.value = false
}

// 過去から選んだときの処理
const onHistorySelected = async (historyItem: ShoppingItemHistorySuggestionModel) => {
  if (!currentHouseholdId.value) return

  name.value = historyItem.name
  storeType.value = historyItem.storeType ?? ''
  selectedSourceShoppingItemId.value = historyItem.sourceShoppingItemId ?? null
  isFavoriteFixed.value = false
}

// お気に入りから選んだときの処理
const showFavoriteModal = ref(false)

const openFavoriteModal = () => {
  showFavoriteModal.value = true
}

const closeFavoriteModal = () => {
  showFavoriteModal.value = false
}

const onFavoriteSelected = async (favoriteItem: ShoppingItemModel) => {
  if (!currentHouseholdId.value) return

  name.value = favoriteItem.name
  memo.value = favoriteItem.memo ?? ''
  storeType.value = favoriteItem.storeType ?? ''
  selectedSourceShoppingItemId.value = favoriteItem.shoppingItemId

  favorite.value = false
  isFavoriteFixed.value = true
}
</script>
