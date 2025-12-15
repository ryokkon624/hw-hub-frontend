<script setup lang="ts">
import { onMounted, computed, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useHouseworkStore } from '@/stores/houseworkStore'
import { useCodeStore } from '@/stores/codeStore'
import { useHouseholdStore } from '@/stores/householdStore'
import { weeklyDaysMaskToLabel } from '@/utils/weeklyDaysLabel'
import type { Housework } from '@/domain'
import HouseholdSwitcherField from '@/components/HouseholdSwitcherField.vue'
import { useHouseworkCodes } from '@/composables/useHouseworkCodes'
import { RECURRENCE_TYPE } from '@/constants/code.constants'

const { t, locale } = useI18n()
const router = useRouter()
const houseworkStore = useHouseworkStore()
const codeStore = useCodeStore()
const householdStore = useHouseholdStore()
const { recurrenceTypeLabel, categoryLabel, weekdayLabel, nthWeekLabel, categoryOptions } =
  useHouseworkCodes()

const filterCategory = ref<string | 'ALL'>('ALL')

// 世帯が変わったら一覧を再取得
watch(
  () => householdStore.currentHouseholdId,
  async (newId) => {
    if (!newId) {
      houseworkStore.clear()
      return
    }
    await houseworkStore.loadAll()
  },
  { immediate: true },
)

onMounted(async () => {
  await codeStore.loadAllIfNeeded()

  if (householdStore.currentHouseholdId) {
    // この画面は毎回メンバーを強制再取得
    await householdStore.fetchMembers(householdStore.currentHouseholdId, { force: true })
  }
})

const getNickName = (userId: number | null) => {
  if (!userId) return ''
  const member = householdStore.currentAllMembers.find((u) => u.userId == userId)
  return member?.nickname
}

// 曜日 bitmask → ラベル
const weeklyDaysLabel = (mask: number | null): string => {
  if (mask == null) return ''
  return weeklyDaysMaskToLabel(mask, locale.value)
}

// recurrence_type + 各カラム → ロケール別・ユーザ向け1行表示
const buildRecurrenceSummary = (hw: Housework): string => {
  const loc = locale.value
  const type = hw.recurrenceType

  // 1: Weekly
  if (type === RECURRENCE_TYPE.WEEKLY) {
    const days = weeklyDaysLabel(hw.weeklyDays)
    if (!days) {
      return loc === 'ja' ? '毎週' : 'Every week'
    }
    return loc === 'ja' ? `毎週 ${days}` : `Every week ${days}`
  }

  // 2: Monthly（日付 / 月末）
  if (type === RECURRENCE_TYPE.MONTHLY) {
    const opt = hw.dayOfMonth ?? null
    const dom = hw.dayOfMonth ?? null

    if (opt === 31) {
      return loc === 'ja' ? '毎月 月末' : 'Every month (last day)'
    }

    const day = opt ?? dom
    if (day != null) {
      return loc === 'ja' ? `毎月 ${day}日` : `Every month day ${day}`
    }

    return loc === 'ja' ? '毎月' : 'Every month'
  }

  // 3: NthWeekday（nthWeek + weekday）
  if (type === RECURRENCE_TYPE.NTH_WEEKDAY) {
    const nth = nthWeekLabel(hw.nthWeek)
    const wd = weekdayLabel(hw.weekday)

    if (nth && wd) {
      // 例: 毎月 最終週日曜日 / Every month Last Week Sunday
      return loc === 'ja' ? `毎月 ${nth}${wd}` : `Every month ${nth} ${wd}`
    }

    // どちらか欠けている場合はざっくり表示
    return loc === 'ja' ? '毎月 第n曜日' : 'Every month (weekday)'
  }

  // 想定外の場合はコードラベルのみ
  return recurrenceTypeLabel(type)
}

// 表示用に加工
const viewItems = computed(() =>
  houseworkStore.items.map((hw: Housework) => ({
    ...hw,
    categoryLabel: categoryLabel(hw.category),
    recurrenceSummary: buildRecurrenceSummary(hw),
  })),
)

// フィルタ適用後
const filteredItems = computed(() => {
  if (filterCategory.value === 'ALL') return viewItems.value
  return viewItems.value.filter((hw) => hw.category === filterCategory.value)
})

const totalCount = computed(() => viewItems.value.length)

const goEdit = (id: number) => {
  router.push({ name: 'settings.housework.edit', params: { houseworkId: id } })
}

const goCreate = () => {
  router.push({ name: 'settings.housework.new' })
}
</script>

<template>
  <div class="space-y-4">
    <!-- ヘッダー -->
    <header class="flex items-center justify-between gap-3">
      <div>
        <h1 class="sr-only">{{ t('housework.list.title') }}</h1>
        <p class="text-sm text-hwhub-muted">{{ t('housework.list.description') }}</p>
      </div>

      <button
        type="button"
        class="hidden sm:inline-flex items-center rounded-full bg-hwhub-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-hwhub-primary"
        @click="goCreate"
      >
        {{ t('housework.list.addButtonLabel') }}
      </button>
    </header>

    <!-- 👇 SP 専用 世帯スイッチャー -->
    <HouseholdSwitcherField class="sm:hidden" />

    <!-- SP 用追加ボタン -->
    <div class="sm:hidden">
      <button
        type="button"
        class="w-full rounded-full bg-hwhub-primary px-4 py-2 text-sm font-semibold text-white hover:bg-hwhub-primary"
        @click="goCreate"
      >
        {{ t('housework.list.addButtonLabel') }}
      </button>
    </div>

    <!-- カード：フィルタ + 一覧 -->
    <section class="rounded-xl border bg-white p-4 shadow-sm space-y-3">
      <!-- 上部バー：件数 + フィルタ -->
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="text-xs text-hwhub-muted">
          {{ t('housework.list.totalPrefix') }}
          <span class="font-semibold text-hwhub-heading">
            {{ totalCount }}
          </span>
          {{ t('housework.list.totalUnit') }}
        </p>

        <!-- カテゴリフィルタ -->
        <div class="flex items-center gap-2 text-xs">
          <span class="text-hwhub-muted">{{ t('housework.list.filter.categoryLabel') }}</span>
          <select
            v-model="filterCategory"
            class="rounded-md border border-gray-300 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-hwhub-primary focus:border-hwhub-primary"
          >
            <option value="ALL">{{ t('housework.list.filter.categoryAll') }}</option>
            <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- 一覧（PC：テーブル表示） -->
      <div class="mt-2 overflow-x-auto hidden md:block">
        <table class="min-w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-gray-200 bg-hwhub-surface-subtle">
              <th class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted">
                {{ t('housework.list.columns.name') }}
              </th>
              <th class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted">
                {{ t('housework.list.columns.category') }}
              </th>
              <th class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted">
                {{ t('housework.list.columns.recurrenceType') }}
              </th>
              <th class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted">
                {{ t('housework.list.columns.defaultAssignee') }}
              </th>
              <th class="px-3 py-2 text-left text-xs font-medium text-hwhub-muted">
                {{ t('housework.list.columns.activePeriod') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="hw in filteredItems"
              :key="hw.houseworkId"
              class="border-b border-gray-100 hover:bg-hwhub-surface-subtle cursor-pointer"
              @click="goEdit(hw.houseworkId)"
            >
              <!-- 家事名 -->
              <td class="px-3 py-2 align-top">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-hwhub-heading truncate">
                    {{ hw.name }}
                  </span>
                </div>
              </td>

              <!-- カテゴリ -->
              <td class="px-3 py-2 align-top">
                <span
                  v-if="hw.categoryLabel"
                  class="inline-flex items-center rounded-full bg-hwhub-surface-subtle px-2 py-0.5 text-[11px] text-hwhub-heading"
                >
                  {{ hw.categoryLabel }}
                </span>
              </td>

              <!-- 周期 -->
              <td class="px-3 py-2 align-top">
                <span class="text-xs text-hwhub-heading">
                  {{ hw.recurrenceSummary }}
                </span>
              </td>

              <!-- デフォルト担当者 -->
              <td class="px-3 py-2 align-top">
                <div class="flex flex-col text-xs text-hwhub-heading">
                  <span>{{ getNickName(hw.defaultAssigneeUserId) }}</span>
                </div>
              </td>

              <!-- 有効期間 -->
              <td class="px-3 py-2 align-top">
                <div class="flex flex-col text-xs text-hwhub-heading">
                  <span>{{ hw.startDate }} 〜 {{ hw.endDate }}</span>
                </div>
              </td>
            </tr>

            <tr v-if="filteredItems.length === 0">
              <td colspan="5" class="px-3 py-6 text-center text-xs text-hwhub-muted">
                {{ t('housework.list.empty') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 一覧（SP：カード表示） -->
      <div class="mt-2 space-y-2 md:hidden">
        <button
          v-for="hw in filteredItems"
          :key="hw.houseworkId"
          type="button"
          class="w-full text-left rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm hover:bg-hwhub-surface-subtle active:bg-hwhub-surface-subtle transition"
          @click="goEdit(hw.houseworkId)"
        >
          <!-- 上段：名前 + カテゴリチップ -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-hwhub-heading truncate">
                {{ hw.name }}
              </p>
              <p class="mt-1 text-xs text-hwhub-muted">
                {{ hw.recurrenceSummary }}
              </p>
            </div>

            <span
              v-if="hw.categoryLabel"
              class="ml-2 inline-flex shrink-0 items-center rounded-full bg-hwhub-surface-subtle px-2 py-0.5 text-[11px] text-hwhub-heading"
            >
              {{ hw.categoryLabel }}
            </span>
          </div>

          <!-- 下段：担当者 + 期間 -->
          <div
            class="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] text-hwhub-muted"
          >
            <span>
              {{ t('housework.list.sp.defaultAssigneeLabel') }}
              <span class="font-medium text-hwhub-heading">
                {{
                  getNickName(hw.defaultAssigneeUserId) ||
                  t('housework.list.sp.defaultAssigneeUnset')
                }}
              </span>
            </span>
            <span> {{ hw.startDate }} 〜 {{ hw.endDate }} </span>
          </div>
        </button>

        <p v-if="filteredItems.length === 0" class="py-6 text-center text-xs text-hwhub-muted">
          {{ t('housework.list.sp.empty') }}
        </p>
      </div>
    </section>
  </div>
</template>
