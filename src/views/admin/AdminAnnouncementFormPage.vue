<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import { useAdminAnnouncementStore } from '@/stores/adminAnnouncementStore'
import { useCodeStore } from '@/stores/codeStore'
import { useUiStore } from '@/stores/uiStore'
import { CODE_TYPE } from '@/constants/code.constants'
import type { AdminAnnouncementRequest } from '@/api/adminApi'
import { resolveCodeLabel } from '@/domain'

const props = defineProps<{ id?: number }>()
const isEdit = computed(() => props.id !== undefined)

const { t, locale } = useI18n()
const router = useRouter()
const store = useAdminAnnouncementStore()
const codeStore = useCodeStore()
const uiStore = useUiStore()

// コードオプション
const severityOptions = computed(() =>
  codeStore.getByType(CODE_TYPE.ANNOUNCEMENT_SEVERITY).map((c) => ({
    value: c.codeValue,
    label: resolveCodeLabel(c, locale.value),
  })),
)

const scopeOptions = computed(() =>
  codeStore.getByType(CODE_TYPE.ANNOUNCEMENT_SCOPE).map((c) => ({
    value: c.codeValue,
    label: resolveCodeLabel(c, locale.value),
  })),
)

// バリデーションスキーマ
const schema = toTypedSchema(
  yup.object({
    titleJa: yup.string().required(),
    titleEn: yup.string().required(),
    titleEs: yup.string().required(),
    bodyJa: yup.string().required(),
    bodyEn: yup.string().required(),
    bodyEs: yup.string().required(),
    severity: yup.string().required(),
    targetScope: yup.string().required(),
    startAt: yup.string().required(),
    endAt: yup
      .string()
      .required()
      .test(
        'end-after-start',
        t('admin.announcement.validation.endAtAfterStartAt'),
        function (value) {
          const { startAt } = this.parent as { startAt: string }
          if (!startAt || !value) return true
          return new Date(value) > new Date(startAt)
        },
      ),
  }),
)

// 編集対象の既存データを探す
const existingItem = computed(() => {
  if (!isEdit.value || props.id == null) return null
  return store.items.find((a) => a.id === props.id) ?? null
})

// フォーム初期値 - LocalDateTimeをdatetime-local形式に変換
const toDatetimeLocal = (iso: string | undefined): string => {
  if (!iso) return ''
  return iso.substring(0, 16) // "YYYY-MM-DDTHH:MM"
}

const {
  handleSubmit,
  defineField,
  errors,
  isSubmitting: formSubmitting,
} = useForm({
  validationSchema: schema,
  initialValues: {
    titleJa: existingItem.value?.titleJa ?? '',
    titleEn: existingItem.value?.titleEn ?? '',
    titleEs: existingItem.value?.titleEs ?? '',
    bodyJa: existingItem.value?.bodyJa ?? '',
    bodyEn: existingItem.value?.bodyEn ?? '',
    bodyEs: existingItem.value?.bodyEs ?? '',
    severity: existingItem.value?.severity ?? '',
    targetScope: existingItem.value?.targetScope ?? '',
    startAt: toDatetimeLocal(existingItem.value?.startAt),
    endAt: toDatetimeLocal(existingItem.value?.endAt),
  },
})

const [titleJa, titleJaAttrs] = defineField('titleJa')
const [titleEn, titleEnAttrs] = defineField('titleEn')
const [titleEs, titleEsAttrs] = defineField('titleEs')
const [bodyJa, bodyJaAttrs] = defineField('bodyJa')
const [bodyEn, bodyEnAttrs] = defineField('bodyEn')
const [bodyEs, bodyEsAttrs] = defineField('bodyEs')
const [severity, severityAttrs] = defineField('severity')
const [targetScope, targetScopeAttrs] = defineField('targetScope')
const [startAt, startAtAttrs] = defineField('startAt')
const [endAt, endAtAttrs] = defineField('endAt')

onMounted(async () => {
  await codeStore.loadAllIfNeeded()
  if (isEdit.value) {
    await store.loadAllIfNeeded()
  }
})

const onSubmit = handleSubmit(async (values) => {
  const req: AdminAnnouncementRequest = {
    titleJa: values.titleJa,
    titleEn: values.titleEn,
    titleEs: values.titleEs,
    bodyJa: values.bodyJa,
    bodyEn: values.bodyEn,
    bodyEs: values.bodyEs,
    severity: values.severity,
    targetScope: values.targetScope,
    startAt: values.startAt + ':00', // datetime-localは秒なし → 秒を付加
    endAt: values.endAt + ':00',
  }
  try {
    if (isEdit.value && props.id != null) {
      await store.update(props.id, req)
      uiStore.showToast('success', t('admin.announcement.toast.updated'))
    } else {
      await store.create(req)
      uiStore.showToast('success', t('admin.announcement.toast.created'))
    }
    router.push({ name: 'admin.announcements' })
  } catch {
    uiStore.showToast('error', t('admin.announcement.toast.error'))
  }
})

const goBack = () => {
  router.push({ name: 'admin.announcements' })
}

const onDelete = async () => {
  if (!props.id || !confirm(t('admin.announcement.deleteConfirm'))) return
  try {
    await store.remove(props.id)
    uiStore.showToast('success', t('admin.announcement.toast.deleted'))
    router.push({ name: 'admin.announcements' })
  } catch {
    uiStore.showToast('error', t('admin.announcement.toast.error'))
  }
}
</script>

<template>
  <div class="space-y-4 max-w-2xl mx-auto">
    <!-- ヘッダー -->
    <header class="flex items-center gap-3">
      <button
        type="button"
        class="text-hwhub-muted hover:text-hwhub-heading transition-colors"
        @click="goBack"
      >
        ←
      </button>
      <h1 class="text-base font-semibold text-hwhub-heading">
        {{ isEdit ? t('pageTitles.adminAnnouncementEdit') : t('pageTitles.adminAnnouncementNew') }}
      </h1>
    </header>

    <form class="space-y-6" @submit.prevent="onSubmit">
      <!-- タイトル 3言語 -->
      <section class="rounded-xl border bg-hwhub-surface-card p-4 shadow-sm space-y-3">
        <h2 class="text-sm font-semibold text-hwhub-heading">
          {{ t('admin.announcement.form.titleSection') }}
        </h2>

        <div class="space-y-2">
          <label class="block text-xs font-medium text-hwhub-muted">
            {{ t('admin.announcement.form.titleJa') }} *
          </label>
          <input
            v-model="titleJa"
            v-bind="titleJaAttrs"
            type="text"
            class="w-full rounded-lg border border-hwhub-border px-3 py-2 text-sm bg-hwhub-surface-card focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          />
          <p v-if="errors.titleJa" class="text-xs text-rose-500">{{ errors.titleJa }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-xs font-medium text-hwhub-muted">
            {{ t('admin.announcement.form.titleEn') }} *
          </label>
          <input
            v-model="titleEn"
            v-bind="titleEnAttrs"
            type="text"
            class="w-full rounded-lg border border-hwhub-border px-3 py-2 text-sm bg-hwhub-surface-card focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          />
          <p v-if="errors.titleEn" class="text-xs text-rose-500">{{ errors.titleEn }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-xs font-medium text-hwhub-muted">
            {{ t('admin.announcement.form.titleEs') }} *
          </label>
          <input
            v-model="titleEs"
            v-bind="titleEsAttrs"
            type="text"
            class="w-full rounded-lg border border-hwhub-border px-3 py-2 text-sm bg-hwhub-surface-card focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          />
          <p v-if="errors.titleEs" class="text-xs text-rose-500">{{ errors.titleEs }}</p>
        </div>
      </section>

      <!-- 本文 3言語 -->
      <section class="rounded-xl border bg-hwhub-surface-card p-4 shadow-sm space-y-3">
        <h2 class="text-sm font-semibold text-hwhub-heading">
          {{ t('admin.announcement.form.bodySection') }}
        </h2>

        <div class="space-y-2">
          <label class="block text-xs font-medium text-hwhub-muted">
            {{ t('admin.announcement.form.bodyJa') }} *
          </label>
          <textarea
            v-model="bodyJa"
            v-bind="bodyJaAttrs"
            rows="4"
            class="w-full rounded-lg border border-hwhub-border px-3 py-2 text-sm bg-hwhub-surface-card focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary resize-none"
          />
          <p v-if="errors.bodyJa" class="text-xs text-rose-500">{{ errors.bodyJa }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-xs font-medium text-hwhub-muted">
            {{ t('admin.announcement.form.bodyEn') }} *
          </label>
          <textarea
            v-model="bodyEn"
            v-bind="bodyEnAttrs"
            rows="4"
            class="w-full rounded-lg border border-hwhub-border px-3 py-2 text-sm bg-hwhub-surface-card focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary resize-none"
          />
          <p v-if="errors.bodyEn" class="text-xs text-rose-500">{{ errors.bodyEn }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-xs font-medium text-hwhub-muted">
            {{ t('admin.announcement.form.bodyEs') }} *
          </label>
          <textarea
            v-model="bodyEs"
            v-bind="bodyEsAttrs"
            rows="4"
            class="w-full rounded-lg border border-hwhub-border px-3 py-2 text-sm bg-hwhub-surface-card focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary resize-none"
          />
          <p v-if="errors.bodyEs" class="text-xs text-rose-500">{{ errors.bodyEs }}</p>
        </div>
      </section>

      <!-- 設定 -->
      <section class="rounded-xl border bg-hwhub-surface-card p-4 shadow-sm space-y-3">
        <h2 class="text-sm font-semibold text-hwhub-heading">
          {{ t('admin.announcement.form.settingsSection') }}
        </h2>

        <div class="space-y-2">
          <label class="block text-xs font-medium text-hwhub-muted">
            {{ t('admin.announcement.form.severity') }} *
          </label>
          <select
            v-model="severity"
            v-bind="severityAttrs"
            class="w-full rounded-lg border border-hwhub-border px-3 py-2 text-sm bg-hwhub-surface-card focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          >
            <option value="">---</option>
            <option v-for="opt in severityOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <p v-if="errors.severity" class="text-xs text-rose-500">{{ errors.severity }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-xs font-medium text-hwhub-muted">
            {{ t('admin.announcement.form.targetScope') }} *
          </label>
          <select
            v-model="targetScope"
            v-bind="targetScopeAttrs"
            class="w-full rounded-lg border border-hwhub-border px-3 py-2 text-sm bg-hwhub-surface-card focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          >
            <option value="">---</option>
            <option v-for="opt in scopeOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <p v-if="errors.targetScope" class="text-xs text-rose-500">{{ errors.targetScope }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-xs font-medium text-hwhub-muted">
            {{ t('admin.announcement.form.startAt') }} *
          </label>
          <input
            v-model="startAt"
            v-bind="startAtAttrs"
            type="datetime-local"
            class="w-full rounded-lg border border-hwhub-border px-3 py-2 text-sm bg-hwhub-surface-card focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          />
          <p v-if="errors.startAt" class="text-xs text-rose-500">{{ errors.startAt }}</p>
        </div>

        <div class="space-y-2">
          <label class="block text-xs font-medium text-hwhub-muted">
            {{ t('admin.announcement.form.endAt') }} *
          </label>
          <input
            v-model="endAt"
            v-bind="endAtAttrs"
            type="datetime-local"
            class="w-full rounded-lg border border-hwhub-border px-3 py-2 text-sm bg-hwhub-surface-card focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          />
          <p v-if="errors.endAt" class="text-xs text-rose-500">{{ errors.endAt }}</p>
        </div>
      </section>

      <!-- ボタン -->
      <div class="flex items-center justify-between gap-3">
        <button
          v-if="isEdit"
          type="button"
          class="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-50 transition"
          :disabled="store.isSubmitting"
          @click="onDelete"
        >
          {{ t('admin.announcement.form.deleteButton') }}
        </button>

        <div class="flex items-center gap-3 ml-auto">
          <button
            type="button"
            class="rounded-full border border-hwhub-border px-4 py-2 text-sm font-semibold text-hwhub-muted hover:bg-hwhub-surface-subtle transition"
            @click="goBack"
          >
            {{ t('admin.announcement.form.cancelButton') }}
          </button>
          <button
            type="submit"
            class="rounded-full bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition"
            :disabled="store.isSubmitting || formSubmitting"
          >
            {{
              isEdit
                ? t('admin.announcement.form.updateButton')
                : t('admin.announcement.form.createButton')
            }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
