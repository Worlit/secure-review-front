<template>
  <div class="loader-container">
    <div :class="['loader', `loader--${size}`]"></div>
    <p v-if="text" class="loader-text">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg'
  text?: string
}>(), {
  size: 'md',
})
</script>

<style scoped src="./BaseLoader.styles.css"></style>
