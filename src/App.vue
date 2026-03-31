<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useHouseholdStore } from '@/stores/householdStore'
import { useRoleStore } from './stores/roleStore'

const authStore = useAuthStore()
const householdStore = useHouseholdStore()
const roleStore = useRoleStore()

onMounted(async () => {
  // ローカルストレージにログイン情報があれば復元
  authStore.initFromStorage()
})

watch(
  () => [authStore.isBootstrapping, authStore.isAuthTransition, authStore.isAuthenticated] as const,
  async ([boot, oauth, authed]) => {
    if (boot) return
    if (oauth) return
    if (!authed) return

    householdStore.initFromStorage()

    if (householdStore.households.length === 0) {
      await householdStore.fetchMyHouseholds()
    }
    if (roleStore.roles.length === 0) {
      await roleStore.fetchMyRoles()
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
