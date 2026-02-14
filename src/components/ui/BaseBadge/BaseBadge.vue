<template>
  <span :class="['badge', `badge--${variant}`, `badge--${size}`]">
    <slot />
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'critical' | 'high' | 'medium' | 'low'
  size?: 'sm' | 'md'
}>(), {
  variant: 'default',
  size: 'md',
})
</script>

<style scoped src="./BaseBadge.styles.css"></style>
