<template>
  <div class="select-wrapper">
    <select
      :id="id"
      v-model="model"
      :disabled="disabled"
      :class="['select', { 'select--error': error }]"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <ChevronDown :size="16" class="select-icon" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

interface Option {
  value: string
  label: string
}

const props = defineProps<{
  modelValue: string
  options: Option[]
  id?: string
  placeholder?: string
  disabled?: boolean
  error?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const id = computed(() => props.id || `select-${Math.random().toString(36).slice(2, 9)}`)
</script>

<style scoped src="./BaseSelect.styles.css"></style>
