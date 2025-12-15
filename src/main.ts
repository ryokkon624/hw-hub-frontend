// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import './assets/main.css'
import { useAuthStore } from '@/stores/authStore'

const app = createApp(App)

app.use(createPinia())

const authStore = useAuthStore()
authStore.initFromStorage()

app.use(router)
app.use(i18n)

app.mount('#app')
