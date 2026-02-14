<template>
  <div class="textarea-wrapper">
    <label v-if="label" :for="id" class="textarea-label">
      {{ label }}
      <span v-if="required" class="textarea-required">*</span>
    </label>
    <textarea
        :id="id"
        v-model="model"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :rows="rows"
        :class="['textarea', { 'textarea--error': error, 'textarea--monospace': monospace }]"
        @blur="$emit('blur')"
    />
    <p v-if="error" class="textarea-error">{{ error }}</p>
    <p v-else-if="hint" class="textarea-hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'

const props = withDefaults(defineProps<{
  modelValue: string
  id?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: string
  rows?: number
  monospace?: boolean
}>(), {
  rows: 10,
  monospace: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const id = computed(() => props.id || `textarea-${Math.random().toString(36).slice(2, 9)}`)
</script>

<style scoped src="./BaseTextarea.styles.css"></style>
