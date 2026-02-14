<template>
  <div :class="['card', { 'card--hoverable': hoverable }]">
    <div v-if="$slots.header || title" class="card__header">
      <slot name="header">
        <h3 class="card__title">{{ title }}</h3>
      </slot>
    </div>
    <div class="card__body">
      <slot/>
    </div>
    <div v-if="$slots.footer" class="card__footer">
      <slot name="footer"/>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  hoverable?: boolean
}>()
</script>

<style scoped src="./BaseCard.styles.css"></style>
