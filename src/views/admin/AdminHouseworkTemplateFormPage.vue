<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import { useAdminHouseworkTemplateStore } from '@/stores/adminHouseworkTemplateStore'
import { useCodeStore } from '@/stores/codeStore'
import { useUiStore } from '@/stores/uiStore'
import { useHouseworkCodes } from '@/composables/useHouseworkCodes'
import { RECURRENCE_TYPE } from '@/constants/code.constants'
import type { AdminHouseworkTemplateRequest } from '@/api/adminApi'
import { weeklyDaysMaskToCodes } from '@/domain'

const props = defineProps<{ id?: number }>()
const isEdit = computed(() => props.id !== undefined)

const { t } = useI18n()
const router = useRouter()
const templateStore = useAdminHouseworkTemplateStore()
const codeStore = useCodeStore()
const uiStore = useUiStore()
const { recurrenceTypeOptions, categoryOptions, weekdayOptions, nthWeekOptions } =
  useHouseworkCodes()

const isFilled = (v: string | null | undefined) => !!(v && v.trim() !== '')

const schema = toTypedSchema(
  yup.object({
    nameJa: yup.string().required(),
    nameEn: yup.string().required(),
    nameEs: yup.string().required(),
    descriptionJa: yup
      .string()
      .test(
        'description-all-or-none',
        t('admin.houseworkTemplate.validation.descriptionAllOrNone'),
        function (value) {
          const { descriptionEn, descriptionEs } = this.parent as {
            descriptionEn: string
            descriptionEs: string
          }
          const filled = [value, descriptionEn, descriptionEs].filter(isFilled)
          return filled.length === 0 || filled.length === 3
        },
      ),
    descriptionEn: yup.string(),
    descriptionEs: yup.string(),
    recommendationJa: yup
      .string()
      .test(
        'recommendation-all-or-none',
        t('admin.houseworkTemplate.validation.recommendationAllOrNone'),
        function (value) {
          const { recommendationEn, recommendationEs } = this.parent as {
            recommendationEn: string
            recommendationEs: string
          }
          const filled = [value, recommendationEn, recommendationEs].filter(isFilled)
          return filled.length === 0 || filled.length === 3
        },
      ),
    recommendationEn: yup.string(),
    recommendationEs: yup.string(),
    category: yup.string().required(),
    recurrenceType: yup.string().required(),
    weeklyDays: yup
      .array()
      .of(yup.string())
      .when('recurrenceType', {
        is: RECURRENCE_TYPE.WEEKLY,
        then: (s) => s.min(1, t('admin.houseworkTemplate.validation.weeklyDaysRequired')),
      }),
    dayOfMonth: yup
      .number()
      .nullable()
      .when('recurrenceType', {
        is: RECURRENCE_TYPE.MONTHLY,
        then: (s) => s.required(t('admin.houseworkTemplate.validation.dayOfMonthRequired')),
      }),
    nthWeek: yup
      .string()
      .nullable()
      .when('recurrenceType', {
        is: RECURRENCE_TYPE.NTH_WEEKDAY,
        then: (s) => s.required(t('admin.houseworkTemplate.validation.nthWeekRequired')),
      }),
    weekday: yup
      .string()
      .nullable()
      .when('recurrenceType', {
        is: RECURRENCE_TYPE.NTH_WEEKDAY,
        then: (s) => s.required(t('admin.houseworkTemplate.validation.weekdayRequired')),
      }),
  }),
)

const { handleSubmit, values, setFieldValue, errors } = useForm({
  validationSchema: schema,
  initialValues: {
    nameJa: '',
    nameEn: '',
    nameEs: '',
    descriptionJa: '',
    descriptionEn: '',
    descriptionEs: '',
    recommendationJa: '',
    recommendationEn: '',
    recommendationEs: '',
    category: '',
    recurrenceType: RECURRENCE_TYPE.WEEKLY,
    weeklyDays: [] as string[],
    dayOfMonth: null as number | null,
    nthWeek: null as string | null,
    weekday: null as string | null,
  },
})

const toggleWeeklyDay = (day: string) => {
  const current = (values.weeklyDays as string[] | undefined) ?? []
  const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day]
  setFieldValue('weeklyDays', next)
}

const isWeekly = computed(() => values.recurrenceType === RECURRENCE_TYPE.WEEKLY)
const isMonthly = computed(() => values.recurrenceType === RECURRENCE_TYPE.MONTHLY)
const isNthWeekday = computed(() => values.recurrenceType === RECURRENCE_TYPE.NTH_WEEKDAY)

onMounted(async () => {
  await codeStore.loadAllIfNeeded()
  if (isEdit.value) {
    if (templateStore.items.length === 0) await templateStore.loadAll()
    const item = templateStore.items.find((t) => t.houseworkTemplateId === props.id)
    if (item) {
      setFieldValue('nameJa', item.nameJa)
      setFieldValue('nameEn', item.nameEn)
      setFieldValue('nameEs', item.nameEs)
      setFieldValue('descriptionJa', item.descriptionJa ?? '')
      setFieldValue('descriptionEn', item.descriptionEn ?? '')
      setFieldValue('descriptionEs', item.descriptionEs ?? '')
      setFieldValue('recommendationJa', item.recommendationJa ?? '')
      setFieldValue('recommendationEn', item.recommendationEn ?? '')
      setFieldValue('recommendationEs', item.recommendationEs ?? '')
      setFieldValue('category', item.category)
      setFieldValue('recurrenceType', item.recurrenceType)
      setFieldValue('dayOfMonth', item.dayOfMonth)
      setFieldValue('nthWeek', item.nthWeek)
      setFieldValue('weekday', item.weekday)
      if (item.weeklyDays != null) {
        setFieldValue('weeklyDays', weeklyDaysMaskToCodes(item.weeklyDays))
      }
    }
  }
})

const onSubmit = handleSubmit(async (vals) => {
  const days = (vals.weeklyDays as string[] | undefined) ?? []
  const weeklyDaysMask =
    vals.recurrenceType === RECURRENCE_TYPE.WEEKLY && days.length > 0
      ? days.reduce((acc: number, d: string) => acc | (1 << parseInt(d)), 0)
      : null

  const req: AdminHouseworkTemplateRequest = {
    nameJa: vals.nameJa,
    nameEn: vals.nameEn,
    nameEs: vals.nameEs,
    descriptionJa: vals.descriptionJa || null,
    descriptionEn: vals.descriptionEn || null,
    descriptionEs: vals.descriptionEs || null,
    recommendationJa: vals.recommendationJa || null,
    recommendationEn: vals.recommendationEn || null,
    recommendationEs: vals.recommendationEs || null,
    category: vals.category,
    recurrenceType: vals.recurrenceType,
    weeklyDays: weeklyDaysMask,
    dayOfMonth: vals.recurrenceType === RECURRENCE_TYPE.MONTHLY ? (vals.dayOfMonth ?? null) : null,
    nthWeek: vals.recurrenceType === RECURRENCE_TYPE.NTH_WEEKDAY ? (vals.nthWeek ?? null) : null,
    weekday: vals.recurrenceType === RECURRENCE_TYPE.NTH_WEEKDAY ? (vals.weekday ?? null) : null,
  }

  try {
    if (isEdit.value) {
      await templateStore.update(props.id!, req)
      uiStore.showToast('success', t('admin.houseworkTemplate.toast.updated'))
    } else {
      await templateStore.create(req)
      uiStore.showToast('success', t('admin.houseworkTemplate.toast.created'))
    }
    router.push({ name: 'admin.houseworkTemplates' })
  } catch {
    uiStore.showToast('error', t('admin.houseworkTemplate.toast.error'))
  }
})

const onDelete = async () => {
  if (!confirm(t('admin.houseworkTemplate.deleteConfirm'))) return
  await templateStore.remove(props.id!)
  uiStore.showToast('success', t('admin.houseworkTemplate.toast.deleted'))
  router.push({ name: 'admin.houseworkTemplates' })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <!-- 基本情報カード -->
    <section class="rounded-xl border bg-white p-4 shadow-sm space-y-4">
      <h2 class="text-sm font-semibold text-hwhub-heading">
        {{ t('housework.form.sections.basic.title') }}
      </h2>

      <!-- nameJa -->
      <div>
        <label class="block text-xs text-hwhub-muted mb-1">
          {{ t('admin.houseworkTemplate.form.nameJa') }}
          <span class="text-red-500">*</span>
        </label>
        <input
          :value="values.nameJa"
          type="text"
          class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          @input="setFieldValue('nameJa', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- nameEn -->
      <div>
        <label class="block text-xs text-hwhub-muted mb-1">
          {{ t('admin.houseworkTemplate.form.nameEn') }}
          <span class="text-red-500">*</span>
        </label>
        <input
          :value="values.nameEn"
          type="text"
          class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          @input="setFieldValue('nameEn', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- nameEs -->
      <div>
        <label class="block text-xs text-hwhub-muted mb-1">
          {{ t('admin.houseworkTemplate.form.nameEs') }}
          <span class="text-red-500">*</span>
        </label>
        <input
          :value="values.nameEs"
          type="text"
          class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          @input="setFieldValue('nameEs', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- descriptionJa -->
      <div>
        <label class="block text-xs text-hwhub-muted mb-1">
          {{ t('admin.houseworkTemplate.form.descriptionJa') }}
        </label>
        <textarea
          :value="values.descriptionJa"
          rows="2"
          class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          @input="setFieldValue('descriptionJa', ($event.target as HTMLTextAreaElement).value)"
        />
        <p v-if="errors.descriptionJa" class="mt-1 text-xs text-red-600">
          {{ errors.descriptionJa }}
        </p>
      </div>

      <!-- descriptionEn -->
      <div>
        <label class="block text-xs text-hwhub-muted mb-1">
          {{ t('admin.houseworkTemplate.form.descriptionEn') }}
        </label>
        <textarea
          :value="values.descriptionEn"
          rows="2"
          class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          @input="setFieldValue('descriptionEn', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>

      <!-- descriptionEs -->
      <div>
        <label class="block text-xs text-hwhub-muted mb-1">
          {{ t('admin.houseworkTemplate.form.descriptionEs') }}
        </label>
        <textarea
          :value="values.descriptionEs"
          rows="2"
          class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          @input="setFieldValue('descriptionEs', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>

      <!-- category -->
      <div>
        <label class="block text-xs text-hwhub-muted mb-1">
          {{ t('housework.form.fields.category') }}
          <span class="text-red-500">*</span>
        </label>
        <select
          :value="values.category"
          class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          @change="setFieldValue('category', ($event.target as HTMLSelectElement).value)"
        >
          <option value="" disabled>{{ t('common.selectPlaceholder') }}</option>
          <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </section>

    <!-- おすすめコメントカード -->
    <section class="rounded-xl border bg-white p-4 shadow-sm space-y-4">
      <h2 class="text-sm font-semibold text-hwhub-heading">
        {{ t('admin.houseworkTemplate.form.recommendationSection') }}
      </h2>

      <!-- recommendationJa -->
      <div>
        <label class="block text-xs text-hwhub-muted mb-1">
          {{ t('admin.houseworkTemplate.form.recommendationJa') }}
        </label>
        <textarea
          :value="values.recommendationJa"
          rows="2"
          class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          @input="setFieldValue('recommendationJa', ($event.target as HTMLTextAreaElement).value)"
        />
        <p v-if="errors.recommendationJa" class="mt-1 text-xs text-red-600">
          {{ errors.recommendationJa }}
        </p>
      </div>

      <!-- recommendationEn -->
      <div>
        <label class="block text-xs text-hwhub-muted mb-1">
          {{ t('admin.houseworkTemplate.form.recommendationEn') }}
        </label>
        <textarea
          :value="values.recommendationEn"
          rows="2"
          class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          @input="setFieldValue('recommendationEn', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>

      <!-- recommendationEs -->
      <div>
        <label class="block text-xs text-hwhub-muted mb-1">
          {{ t('admin.houseworkTemplate.form.recommendationEs') }}
        </label>
        <textarea
          :value="values.recommendationEs"
          rows="2"
          class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          @input="setFieldValue('recommendationEs', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>
    </section>

    <!-- 周期設定カード -->
    <section class="rounded-xl border bg-white p-4 shadow-sm space-y-4">
      <h2 class="text-sm font-semibold text-hwhub-heading">
        {{ t('housework.form.sections.recurrence.title') }}
      </h2>

      <!-- recurrenceType -->
      <div>
        <label class="block text-xs text-hwhub-muted mb-1">
          {{ t('housework.form.fields.recurrenceType') }}
        </label>
        <select
          :value="values.recurrenceType"
          class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          @change="setFieldValue('recurrenceType', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="opt in recurrenceTypeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- Weekly: 曜日チェックボックス -->
      <div v-show="isWeekly">
        <label class="block text-xs text-hwhub-muted mb-1">
          {{ t('housework.form.fields.weeklyDays') }}
        </label>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="opt in weekdayOptions"
            :key="opt.value"
            class="inline-flex items-center gap-1 rounded-full border border-hwhub-border px-2 py-0.5 text-xs text-hwhub-heading bg-hwhub-surface-subtle cursor-pointer"
          >
            <input
              type="checkbox"
              :value="opt.value"
              :checked="((values.weeklyDays as string[] | undefined) ?? []).includes(opt.value)"
              class="rounded border-hwhub-border"
              @change="toggleWeeklyDay(opt.value)"
            />
            <span>{{ opt.label }}</span>
          </label>
        </div>
        <p v-if="errors.weeklyDays" class="mt-1 text-xs text-red-600">
          {{ errors.weeklyDays }}
        </p>
      </div>

      <!-- Monthly: 日付 -->
      <div v-show="isMonthly">
        <label class="block text-xs text-hwhub-muted mb-1">
          {{ t('housework.form.fields.dayOfMonth') }}
        </label>
        <select
          :value="values.dayOfMonth"
          class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          @change="
            setFieldValue(
              'dayOfMonth',
              ($event.target as HTMLSelectElement).value
                ? Number(($event.target as HTMLSelectElement).value)
                : null,
            )
          "
        >
          <option :value="null">{{ t('common.selectPlaceholder') }}</option>
          <option v-for="d in 30" :key="d" :value="d">{{ d }}</option>
          <option :value="31">{{ t('housework.form.fields.lastDayOfMonth') }}</option>
        </select>
        <p v-if="errors.dayOfMonth" class="mt-1 text-xs text-red-600">
          {{ errors.dayOfMonth }}
        </p>
      </div>

      <!-- NthWeekday: 第n週 + 曜日 -->
      <div v-show="isNthWeekday" class="space-y-3">
        <div>
          <label class="block text-xs text-hwhub-muted mb-1">
            {{ t('housework.form.fields.nthWeek') }}
          </label>
          <select
            :value="values.nthWeek"
            class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
            @change="setFieldValue('nthWeek', ($event.target as HTMLSelectElement).value || null)"
          >
            <option :value="null">{{ t('common.selectPlaceholder') }}</option>
            <option v-for="opt in nthWeekOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <p v-if="errors.nthWeek" class="mt-1 text-xs text-red-600">
            {{ errors.nthWeek }}
          </p>
        </div>

        <div>
          <label class="block text-xs text-hwhub-muted mb-1">
            {{ t('housework.form.fields.weekday') }}
          </label>
          <select
            :value="values.weekday"
            class="w-full rounded-md border border-hwhub-border px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
            @change="setFieldValue('weekday', ($event.target as HTMLSelectElement).value || null)"
          >
            <option :value="null">{{ t('common.selectPlaceholder') }}</option>
            <option v-for="opt in weekdayOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <p v-if="errors.weekday" class="mt-1 text-xs text-red-600">
            {{ errors.weekday }}
          </p>
        </div>
      </div>
    </section>

    <!-- ボタン -->
    <div class="flex items-center justify-between gap-2 pt-2">
      <!-- 削除ボタン（編集時のみ） -->
      <button
        v-if="isEdit"
        type="button"
        class="px-4 py-2 rounded-md text-xs md:text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50"
        :disabled="templateStore.isSubmitting"
        @click="onDelete"
      >
        {{ t('common.delete') }}
      </button>
      <div v-else />

      <div class="flex gap-2">
        <button
          type="button"
          class="px-4 py-2 rounded-md border border-hwhub-border text-xs md:text-sm text-hwhub-muted hover:bg-hwhub-surface-subtle"
          @click="router.push({ name: 'admin.houseworkTemplates' })"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="submit"
          class="px-4 py-2 rounded-md text-xs md:text-sm font-semibold text-white bg-hwhub-primary hover:opacity-90 disabled:opacity-50"
          :disabled="templateStore.isSubmitting"
        >
          {{ t('common.save') }}
        </button>
      </div>
    </div>
  </form>
</template>
