<template>
  <div class="space-y-4">
    <!-- タイトル -->
    <header class="flex items-center justify-between">
      <div>
        <h1 class="sr-only">{{ t('shopping.detail.titleSr') }}</h1>
        <p class="text-sm text-hwhub-muted">{{ t('shopping.detail.intro') }}</p>
      </div>
      <button
        type="button"
        class="hidden sm:inline-flex items-center rounded-full bg-hwhub-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-hwhub-primary"
        @click="goBack"
      >
        {{ t('shopping.detail.back') }}
      </button>
    </header>

    <!-- SP 用戻るボタン -->
    <div class="sm:hidden">
      <button
        type="button"
        class="w-full rounded-full bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:bg-hwhub-primary"
        @click="goBack"
      >
        {{ t('shopping.detail.back') }}
      </button>
    </div>

    <!-- メインレイアウト：PC は2カラム -->
    <div class="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <!-- 左：基本情報 -->
      <section class="rounded-xl border bg-white p-4 shadow-sm space-y-4">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0 space-y-2">
            <!-- 品名 -->
            <div>
              <label class="block text-xs text-hwhub-muted mb-1">{{
                t('shopping.detail.fields.name')
              }}</label>
              <input
                v-model="editableName"
                type="text"
                class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
                maxlength="100"
              />
            </div>

            <!-- メモ -->
            <div>
              <label class="block text-xs text-hwhub-muted mb-1">{{
                t('shopping.detail.fields.memo')
              }}</label>
              <textarea
                v-model="editableMemo"
                class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
                rows="3"
                maxlength="255"
              />
            </div>

            <!-- 購入場所 -->
            <div>
              <label class="block text-xs text-hwhub-muted mb-1">{{
                t('shopping.detail.fields.storeType')
              }}</label>
              <select
                v-model="editableStoreType"
                class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
              >
                <option value="">{{ t('shopping.detail.fields.storeTypeUnset') }}</option>
                <option v-for="opt in storeTypeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- お気に入り -->
          <div class="shrink-0 flex flex-col items-end gap-2">
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-yellow-400 hover:border-yellow-300 hover:bg-yellow-50 hover:scale-105 transition"
              @click="onToggleFavorite"
            >
              <span v-if="item?.favorite">★</span>
              <span v-else class="text-gray-300">☆</span>
            </button>
            <p class="text-[11px] text-hwhub-muted">
              {{ t('shopping.detail.fields.favoriteLabel') }}
            </p>
          </div>
        </div>

        <!-- ステータス：ステップ風 UI -->
        <div>
          <p class="block text-xs text-hwhub-muted mb-1">
            {{ t('shopping.detail.fields.status') }}
          </p>

          <div class="flex flex-col gap-1.5">
            <div class="flex items-center gap-3 text-xs">
              <button
                v-for="(step, idx) in statusSteps"
                :key="step.value"
                type="button"
                class="flex items-center gap-1.5"
                @click="onChangeStatus(step.value)"
              >
                <!-- 丸いステップアイコン -->
                <div
                  class="flex h-7 w-7 items-center justify-center rounded-full text-[11px] border transition"
                  :class="[
                    isStatusDone(idx)
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : isStatusActive(idx)
                        ? 'bg-hwhub-primary text-white border-hwhub-primary'
                        : 'bg-hwhub-surface-subtle text-hwhub-muted border-gray-200',
                  ]"
                >
                  <span v-if="isStatusDone(idx)">✓</span>
                  <span v-else>{{ step.icon }}</span>
                </div>
                <!-- ラベル -->
                <span
                  class="text-[11px]"
                  :class="[
                    isStatusActive(idx)
                      ? 'text-hwhub-heading font-semibold'
                      : isStatusDone(idx)
                        ? 'text-hwhub-muted'
                        : 'text-hwhub-muted/70',
                  ]"
                >
                  {{ step.label }}
                </span>
              </button>
            </div>

            <!-- ステータスの説明 -->
            <p class="text-[11px] text-hwhub-muted">
              {{ statusHelpText }}
            </p>
          </div>
        </div>

        <!-- 保存ボタン -->
        <div class="flex justify-end">
          <button
            type="button"
            class="inline-flex items-center rounded-md bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:bg-hwhub-primary disabled:opacity-50"
            :disabled="!hasChanges || !item"
            @click="onSave"
          >
            {{ t('shopping.detail.saveButton') }}
          </button>
        </div>
      </section>

      <!-- 右：画像ギャラリー -->
      <section class="rounded-xl border bg-white p-4 shadow-sm space-y-3">
        <h2 class="text-sm font-semibold mb-1 text-hwhub-heading">
          {{ t('shopping.detail.imageSection.title') }}
        </h2>

        <!-- メイン画像 -->
        <div
          class="relative w-full rounded-xl bg-hwhub-surface-subtle flex items-center justify-center overflow-hidden aspect-4/3"
        >
          <template v-if="selectedImageUrl">
            <img :src="selectedImageUrl" :alt="t('shopping.detail.fields.name')" class="w-full h-full object-cover" />
            <button
              v-if="selectedAttachment"
              type="button"
              class="absolute top-2 right-2 rounded-full bg-black/60 text-white text-[11px] px-2 py-1 hover:bg-black/75"
              @click="onDeleteAttachment(selectedAttachment)"
            >
              {{ t('shopping.detail.imageSection.deleteButton') }}
            </button>
          </template>
          <template v-else>
            <p class="text-xs text-hwhub-muted">{{ t('shopping.detail.imageSection.none') }}</p>
          </template>
        </div>

        <!-- サムネイル一覧 -->
        <div v-if="attachments.length > 0" class="flex gap-2 overflow-x-auto py-1">
          <button
            v-for="att in attachments"
            :key="att.id"
            type="button"
            class="relative h-14 w-14 rounded-lg overflow-hidden border"
            :class="
              att.id === selectedAttachmentId
                ? 'border-hwhub-primary'
                : 'border-gray-200 hover:border-gray-400'
            "
            @click="onSelectThumbnail(att)"
          >
            <img :src="att.imageUrl" alt="" class="w-full h-full object-cover" />
          </button>
        </div>

        <!-- 画像を追加 -->
        <div class="pt-2 border-t mt-2">
          <p class="text-xs text-hwhub-muted mb-1">
            {{ t('shopping.detail.imageSection.addTitle') }}
          </p>
          <ImageFileInput
            label=""
            :description="t('shopping.detail.imageSection.description')"
            :accept="'image/*'"
            :multiple="false"
            :max-size-mb="2"
            :showPreview="false"
            @update:model-value="onFilesSelected"
            @error="onUploadError"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHouseholdStore } from '@/stores/householdStore'
import { useShoppingStore } from '@/stores/shoppingStore'
import { useShoppingItemAttachmentStore } from '@/stores/shoppingItemAttachmentStore'
import { useUiStore } from '@/stores/uiStore'
import type {
  ShoppingItemModel,
  ShoppingItemAttachmentModel,
  ShoppingItemUpdateInput,
} from '@/domain'
import ImageFileInput from '@/components/inputs/ImageFileInput.vue'
import { useShoppingCodes } from '@/composables/useShoppingCodes'
import { SHOPPING_ITEM_STATUS } from '@/constants/code.constants'
import type { ShoppingItemStatusCode, PurchaseLocationTypeCode } from '@/constants/code.constants'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const householdStore = useHouseholdStore()
const shoppingStore = useShoppingStore()
const attachmentStore = useShoppingItemAttachmentStore()
const uiStore = useUiStore()
const { storeTypeOptions, shoppingItemStatusLabel } = useShoppingCodes()

/* --- context --- */
const currentHouseholdId = computed(() => householdStore.currentHouseholdId ?? null)
const itemId = computed(() => Number(route.params.itemId))

/* --- アイテム本体 --- */
const item = computed<ShoppingItemModel | null>(() =>
  shoppingStore.getItemById(currentHouseholdId.value, itemId.value),
)

/* --- フォーム (template に合わせる) --- */
const editableName = ref('')
const editableMemo = ref('')
const editableStoreType = ref('' as PurchaseLocationTypeCode)

const original = ref<{
  name: string
  memo: string | null
  storeType: string
} | null>(null)

/* --- 添付画像 --- */
const attachments = computed<ShoppingItemAttachmentModel[]>(() => {
  return attachmentStore.attachments(itemId.value)
})

const selectedAttachmentId = ref<number | null>(null)

const selectedAttachment = computed<ShoppingItemAttachmentModel | null>(() => {
  return attachments.value.find((a) => a.id === selectedAttachmentId.value) ?? null
})

const selectedImageUrl = computed(() => selectedAttachment.value?.imageUrl ?? null)

/* --- 初期化 --- */
const initForm = () => {
  if (!item.value) return
  editableName.value = item.value.name
  editableMemo.value = item.value.memo ?? ''
  editableStoreType.value = item.value.storeType ?? ''

  original.value = {
    name: editableName.value,
    memo: editableMemo.value,
    storeType: editableStoreType.value,
  }
}

onMounted(async () => {
  if (!currentHouseholdId.value) return

  try {
    await uiStore.withLoading(async () => {
      if (!item.value) {
        await shoppingStore.fetchItems(currentHouseholdId.value!, { force: true })
      }
      await attachmentStore.fetchAttachments(itemId.value)
    })

    initForm()

    // サムネの初期選択
    if (attachments.value.length > 0) {
      if (!attachments.value[0]) return
      selectedAttachmentId.value = attachments.value[0].id
    }
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', t('shopping.detail.messages.fetchError'))
  }
})

/* --- 変更検知 --- */
const hasChanges = computed(() => {
  if (!original.value) return false
  return (
    editableName.value.trim() !== original.value.name ||
    (editableMemo.value || '').trim() !== (original.value.memo || '') ||
    editableStoreType.value !== original.value.storeType
  )
})

/* --- ナビゲーション --- */
const goBack = () => router.back()

/* --- サムネ選択 --- */
const onSelectThumbnail = (att: ShoppingItemAttachmentModel) => {
  selectedAttachmentId.value = att.id
}

/* --- 保存 --- */
const onSave = async () => {
  if (!item.value || !currentHouseholdId.value) return
  if (!hasChanges.value) return

  const payload: ShoppingItemUpdateInput = {
    name: editableName.value.trim(),
    memo: editableMemo.value.trim() || null,
    storeType: editableStoreType.value || '',
    favorite: item.value.favorite,
  }

  try {
    await uiStore.withLoading(async () => {
      await shoppingStore.updateItemBasicInfo(
        item.value!.householdId,
        item.value!.shoppingItemId,
        payload,
      )
    })

    initForm()
    uiStore.showToast('success', t('shopping.detail.messages.updateSuccess'))
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', t('shopping.detail.messages.updateError'))
  }
}

/* --- ステータス変更 --- */
const onChangeStatus = async (status: ShoppingItemStatusCode) => {
  if (!item.value || !currentHouseholdId.value) return
  try {
    await shoppingStore.updateStatus(item.value.householdId, item.value.shoppingItemId, status)
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', t('shopping.detail.messages.statusUpdateError'))
  }
}

const statusSteps: { value: ShoppingItemStatusCode; label: string; icon: string }[] = [
  {
    value: SHOPPING_ITEM_STATUS.NOT_PURCHASED,
    label: shoppingItemStatusLabel(SHOPPING_ITEM_STATUS.NOT_PURCHASED),
    icon: '1',
  },
  {
    value: SHOPPING_ITEM_STATUS.IN_BASKET,
    label: shoppingItemStatusLabel(SHOPPING_ITEM_STATUS.IN_BASKET),
    icon: '2',
  },
  {
    value: SHOPPING_ITEM_STATUS.PURCHASED,
    label: shoppingItemStatusLabel(SHOPPING_ITEM_STATUS.PURCHASED),
    icon: '3',
  },
]

const currentStatusIndex = computed(() => {
  const current = item.value?.status ?? SHOPPING_ITEM_STATUS.NOT_PURCHASED
  const idx = statusSteps.findIndex((s) => s.value === current)
  return idx >= 0 ? idx : 0
})

const statusHelpText = computed(() => {
  const current = item.value?.status ?? SHOPPING_ITEM_STATUS.NOT_PURCHASED
  switch (current) {
    case SHOPPING_ITEM_STATUS.NOT_PURCHASED:
      return t('shopping.detail.statusHelp.notPurchased')
    case SHOPPING_ITEM_STATUS.IN_BASKET:
      return t('shopping.detail.statusHelp.inBasket')
    case SHOPPING_ITEM_STATUS.PURCHASED:
      return t('shopping.detail.statusHelp.purchased')
    default:
      return ''
  }
})

const isStatusDone = (idx: number) => idx < currentStatusIndex.value
const isStatusActive = (idx: number) => idx === currentStatusIndex.value

/* --- お気に入り --- */
const onToggleFavorite = async () => {
  if (!item.value || !currentHouseholdId.value) return
  try {
    await shoppingStore.toggleFavorite(item.value.householdId, item.value.shoppingItemId)
  } catch (e) {
    console.error(e)
    uiStore.showToast('error', t('shopping.detail.messages.favoriteUpdateError'))
  }
}

/* --- 画像追加 --- */
const onFilesSelected = async (fileOrFiles: File | File[] | null) => {
  if (!item.value || !fileOrFiles) return

  const file = Array.isArray(fileOrFiles) ? fileOrFiles[0] : fileOrFiles
  if (!file) return

  try {
    await uiStore.withLoading(async () => {
      await attachmentStore.uploadAttachment(item.value!.shoppingItemId, file)
    })
    uiStore.showToast('success', t('shopping.detail.messages.imageAddSuccess'))
  } catch {
    uiStore.showToast('error', t('shopping.detail.messages.imageAddError'))
  }
}

/* --- 画像削除 --- */
const onDeleteAttachment = async (att: ShoppingItemAttachmentModel) => {
  if (!item.value) return
  if (!confirm(t('shopping.detail.messages.imageDeleteConfirm'))) return

  try {
    await uiStore.withLoading(async () => {
      await attachmentStore.deleteAttachment(item.value!.shoppingItemId, att.id)
    })

    // 選択リセット
    const list = attachments.value
    selectedAttachmentId.value = list[0]?.id ?? null

    uiStore.showToast('success', t('shopping.detail.messages.imageDeleteSuccess'))
  } catch {
    uiStore.showToast('error', t('shopping.detail.messages.imageDeleteError'))
  }
}

const onUploadError = (message: string) => {
  uiStore.showToast('error', message)
}
</script>
