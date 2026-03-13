<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm font-medium text-hwhub-heading">
      {{ label }}
    </label>

    <!-- 見た目用ラッパ -->
    <label
      :for="inputId"
      class="flex items-center justify-between gap-3 rounded-xl border border-dashed border-hwhub-border-subtle bg-hwhub-surface-subtle px-3 py-2 text-sm cursor-pointer hover:border-hwhub-primary hover:bg-white transition"
      :class="{ 'opacity-60 cursor-default': loading }"
    >
      <div class="flex items-center gap-2">
        <!-- 簡易アイコン -->
        <div
          class="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm text-hwhub-heading"
        >
          <Camera class="w-5 h-5 text-hwhub-primary" />
        </div>
        <div class="flex flex-col">
          <span class="font-medium text-hwhub-heading">
            {{ buttonLabel }}
          </span>
          <span class="text-xs text-hwhub-muted">
            {{ displayFileName }}
          </span>
        </div>
      </div>

      <span class="text-xs text-hwhub-muted">
        {{ rightHintLabel }}
      </span>
    </label>

    <!-- 本物の input（非表示） -->
    <input
      :id="inputId"
      ref="fileInputRef"
      type="file"
      class="hidden"
      :accept="accept"
      :multiple="multiple"
      :disabled="loading"
      @change="onFileChange"
    />

    <!-- 説明 -->
    <p v-if="description" class="text-xs text-hwhub-muted">
      {{ description }}
    </p>

    <!-- エラー -->
    <p v-if="mergedErrorMessage" class="text-xs text-red-500">
      {{ mergedErrorMessage }}
    </p>

    <!-- プレビュー -->
    <div v-if="showPreview && previewUrls.length > 0">
      <!-- 単一 -->
      <div v-if="!multiple" class="flex justify-start">
        <img
          :src="previewUrls[0]"
          alt="preview"
          class="mt-1 h-24 w-24 rounded-lg object-cover shadow-sm"
        />
      </div>
      <!-- 複数 -->
      <div v-else class="mt-1 grid grid-cols-3 gap-2">
        <img
          v-for="url in previewUrls"
          :key="url"
          :src="url"
          alt="preview"
          class="h-20 w-full rounded-lg object-cover shadow-sm"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Camera } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    label?: string
    description?: string
    accept?: string
    multiple?: boolean
    buttonText?: string
    rightHint?: string
    modelValue?: File | File[] | null
    errorMessage?: string | null
    maxSizeBytes?: number
    loading?: boolean
    showPreview?: boolean
  }>(),
  {
    accept: 'image/*',
    multiple: false,
    buttonText: undefined,
    rightHint: undefined,
    modelValue: null,
    errorMessage: null,
    maxSizeBytes: undefined,
    loading: false,
    showPreview: true,
  },
)

const emit = defineEmits<{
  (e: 'change', files: File[] | null): void
  (e: 'update:modelValue', value: File | File[] | null): void
  (e: 'error', message: string): void
}>()

const inputId = `file-input-${Math.random().toString(36).slice(2)}`
const fileInputRef = ref<HTMLInputElement | null>(null)

const fileNames = ref<string[]>([])
const previewUrls = ref<string[]>([])
const localError = ref<string | null>(null)
const buttonLabel = computed(() => props.buttonText ?? t('common.fileInput.buttonDefault'))
const rightHintLabel = computed(() => props.rightHint ?? t('common.fileInput.rightHintDefault'))

const displayFileName = computed(() => {
  if (!fileNames.value.length) {
    return t('common.fileInput.noFileSelected')
  }
  return props.multiple ? fileNames.value.join('、') : fileNames.value[0]
})

const mergedErrorMessage = computed(() => {
  // vee-validate からの errorMessage を優先しつつ
  // なければローカルエラーを出す
  return props.errorMessage || localError.value
})

const revokePreviews = () => {
  previewUrls.value.forEach((url) => URL.revokeObjectURL(url))
  previewUrls.value = []
}

onBeforeUnmount(() => {
  revokePreviews()
})

// 外から modelValue が変わったとき（クリアなど）に反映
watch(
  () => props.modelValue,
  (val) => {
    // null になったら表示もクリア
    if (!val) {
      fileNames.value = []
      revokePreviews()
      localError.value = null
      if (fileInputRef.value) {
        fileInputRef.value.value = ''
      }
      return
    }

    // v-model 経由でセットされた場合のプレビュー同期（オプショナル）
    const files = Array.isArray(val) ? val : [val]
    fileNames.value = files.map((f) => f.name)
    revokePreviews()
    previewUrls.value = files.map((f) => URL.createObjectURL(f))
  },
)

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const filesRaw = input.files

  localError.value = null
  revokePreviews()

  if (!filesRaw || filesRaw.length === 0) {
    fileNames.value = []
    emit('change', null)
    emit('update:modelValue', null)
    return
  }

  let files = Array.from(filesRaw)
  if (!props.multiple) {
    if (files[0]) files = [files[0]]
  }

  // maxSizeBytes が指定されていれば簡易チェック
  if (props.maxSizeBytes != null) {
    const invalid = files.find((f) => f.size > props.maxSizeBytes!)
    if (invalid) {
      localError.value = t('common.fileInput.fileSizeError')
      emit('error', localError.value)
      fileNames.value = []
      emit('change', null)
      emit('update:modelValue', null)
      if (fileInputRef.value) {
        fileInputRef.value.value = ''
      }
      return
    }
  }

  fileNames.value = files.map((f) => f.name)
  previewUrls.value = files.map((f) => URL.createObjectURL(f))

  // 互換: change イベント（常に配列）
  emit('change', files)

  // v-model 用: 単一なら File、複数なら File[]
  const value: File | File[] | null = props.multiple ? files : (files[0] ?? null)
  emit('update:modelValue', value)
}
</script>
