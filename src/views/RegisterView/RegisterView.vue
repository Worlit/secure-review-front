<template>
  <AuthLayout>
    <BaseCard>
      <form @submit.prevent="handleSubmit" class="register-form">
        <h2 class="register-form__title">Создать аккаунт</h2>

        <BaseAlert
            v-if="errorMessage"
            variant="error"
            :show="true"
            dismissible
            @close="errorMessage = ''"
        >
          {{ errorMessage }}
        </BaseAlert>

        <div class="register-form__fields">
          <BaseInput
              v-model="username"
              type="text"
              label="Имя пользователя"
              placeholder="johndoe"
              required
              autocomplete="username"
              :error="usernameError"
          />

          <BaseInput
              v-model="email"
              type="email"
              label="Email"
              placeholder="your@email.com"
              required
              autocomplete="email"
              :error="emailError"
          />

          <BaseInput
              v-model="password"
              type="password"
              label="Пароль"
              placeholder="Минимум 8 символов"
              required
              autocomplete="new-password"
              :error="passwordError"
          />

          <BaseInput
              v-model="confirmPassword"
              type="password"
              label="Подтверждение пароля"
              placeholder="Повторите пароль"
              required
              autocomplete="new-password"
              :error="confirmPasswordError"
          />
        </div>

        <div class="register-form__actions">
          <BaseButton
              type="submit"
              variant="primary"
              size="lg"
              block
              :loading="authStore.isRegistering"
          >
            Зарегистрироваться
          </BaseButton>

          <div class="register-form__divider">
            <span>или</span>
          </div>

          <BaseButton
              type="button"
              variant="github"
              size="lg"
              block
              :loading="authStore.isGitHubLoggingIn"
              @click="handleGitHubRegister"
          >
            <Github :size="20"/>
            Продолжить с GitHub
          </BaseButton>
        </div>

        <p class="register-form__footer">
          Уже есть аккаунт?
          <router-link to="/login">Войти</router-link>
        </p>
      </form>
    </BaseCard>
  </AuthLayout>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {useRouter} from 'vue-router'
import {useAuthStore} from '@/stores';
import {AuthLayout} from '@/components/layout'
import {BaseAlert, BaseButton, BaseCard, BaseInput} from '@/components/ui'
import {Github} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

// Validation
const usernameError = computed(() => {
  if (username.value && username.value.length < 3) {
    return 'Минимум 3 символа'
  }
  return ''
})

const emailError = computed(() => {
  if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    return 'Некорректный email'
  }
  return ''
})

const passwordError = computed(() => {
  if (password.value && password.value.length < 8) {
    return 'Минимум 8 символов'
  }
  return ''
})

const confirmPasswordError = computed(() => {
  if (confirmPassword.value && confirmPassword.value !== password.value) {
    return 'Пароли не совпадают'
  }
  return ''
})

async function handleSubmit() {
  errorMessage.value = ''

  // Validate all fields
  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    errorMessage.value = 'Заполните все поля'
    return
  }

  if (usernameError.value || emailError.value || passwordError.value || confirmPasswordError.value) {
    errorMessage.value = 'Исправьте ошибки в форме'
    return
  }

  const success = await authStore.register(username.value, email.value, password.value)

  if (success) {
    router.push('/reviews')
  } else {
    errorMessage.value = authStore.error || 'Ошибка регистрации'
  }
}

function handleGitHubRegister() {
  authStore.loginWithGitHub()
}
</script>

<style scoped src="./RegisterView.styles.css"></style>
