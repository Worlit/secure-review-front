<script setup lang="ts">
import {onMounted} from 'vue'
import {useAuthStore} from '@/stores'
import {AppHeader} from '@/components/layout'

const authStore = useAuthStore()

onMounted(async () => {
  // Initialize auth state on app load
  await authStore.init()
})
</script>

<template>
  <div class="app">
    <AppHeader v-if="authStore.isFullyLoaded"/>
    <main class="app__main">
      <router-view/>
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app__main {
  flex: 1;
  background-color: var(--color-bg);
}
</style>
