<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useHouseholdStore } from '@/stores/householdStore'

const authStore = useAuthStore()
const householdStore = useHouseholdStore()

onMounted(async () => {
  // ローカルストレージにログイン情報があれば復元
  authStore.initFromStorage()

  if (authStore.isAuthenticated) {
    // 世帯情報を確実に復元 or 再取得
    householdStore.initFromStorage()

    if (householdStore.households.length === 0) {
      await householdStore.fetchMyHouseholds()
    }
  }
})
</script>

<style>
body {
  margin: 0;
}
</style>
