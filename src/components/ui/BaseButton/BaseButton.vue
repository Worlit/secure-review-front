<template>
  <button
    :class="[
      'btn',
      `btn--${variant}`,
      `btn--${size}`,
      { 'btn--loading': loading, 'btn--block': block },
    ]"
    :disabled="disabled || loading"
    :type="type"
    @click="$emit('click', $event)">
    <span v-if="loading" class="btn__spinner"></span>
    <span :class="{ 'btn__content--hidden': loading }">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'github' | 'success';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
}>();

defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<style scoped src="./BaseButton.styles.css"></style>
