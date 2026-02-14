<script setup lang="ts">
import {ShieldCheck} from 'lucide-vue-next';
</script>

<template>
  <div class="auth-layout">
    <div class="auth-layout__container">
      <div class="auth-layout__header">
        <div class="auth-layout__logo">
          <ShieldCheck :size="40" :stroke-width="2"/>
        </div>
        <h1 class="auth-layout__title">Secure Review</h1>
        <p class="auth-layout__subtitle">Анализ безопасности кода с помощью AI</p>
      </div>
      <slot/>
    </div>
  </div>
</template>

<style scoped src="./AuthLayout.styles.css"></style>
