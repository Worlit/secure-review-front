<template>
  <div v-if="show" :class="['alert', `alert--${variant}`]" role="alert">
    <div class="alert__content">
      <slot />
    </div>
    <button v-if="dismissible" class="alert__close" @click="$emit('close')">
      <X :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next';

withDefaults(
  defineProps<{
    variant?: 'info' | 'success' | 'warning' | 'error';
    show?: boolean;
    dismissible?: boolean;
  }>(),
  {
    variant: 'info',
    show: true,
    dismissible: false,
  }
);

defineEmits<{
  close: [];
}>();
</script>

<style scoped src="./BaseAlert.styles.css"></style>
