<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useHouseholdStore } from '@/stores/householdStore'

const authStore = useAuthStore()
const householdStore = useHouseholdStore()

onMounted(async () => {
  // ローカルストレージにログイン情報があれば復元
  authStore.initFromStorage()
})

watch(
  () => [authStore.isBootstrapping, authStore.isAuthenticated] as const,
  async ([boot, authed]) => {
    if (boot) return
    if (!authed) return

    householdStore.initFromStorage()

    if (householdStore.households.length === 0) {
      await householdStore.fetchMyHouseholds()
    }
  },
  { immediate: true },
)
</script>

<style>
body {
  margin: 0;
}
</style>
