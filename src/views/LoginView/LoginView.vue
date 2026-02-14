<template>
  <AuthLayout>
    <BaseCard>
      <div v-if="isProcessingCallback" class="login-callback">
        <div class="login-callback__spinner"></div>
        <p class="login-callback__text">Завершаем авторизацию...</p>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="login-form">
        <h2 class="login-form__title">Вход в аккаунт</h2>

        <BaseAlert
            v-if="errorMessage"
            variant="error"
            :show="true"
            dismissible
            @close="errorMessage = ''">
          {{ errorMessage }}
        </BaseAlert>

        <BaseAlert
            v-if="oauthError"
            variant="error"
            :show="true"
            dismissible
            @close="oauthError = ''">
          {{ oauthErrorMessage }}
        </BaseAlert>

        <div class="login-form__fields">
          <BaseInput
              v-model="email"
              type="email"
              label="Email"
              placeholder="your@email.com"
              required
              autocomplete="email"/>

          <BaseInput
              v-model="password"
              type="password"
              label="Пароль"
              placeholder="Введите пароль"
              required
              autocomplete="current-password"/>
        </div>

        <div class="login-form__actions">
          <BaseButton
              type="submit"
              variant="primary"
              size="lg"
              block
              :loading="authStore.isLoggingIn">
            Войти
          </BaseButton>

          <div class="login-form__divider">
            <span>или</span>
          </div>

          <BaseButton
              type="button"
              variant="github"
              size="lg"
              block
              :loading="authStore.isGitHubLoggingIn"
              @click="handleGitHubLogin">
            <Github :size="20"/>
            Войти через GitHub
          </BaseButton>
        </div>

        <p class="login-form__footer">
          Нет аккаунта?
          <router-link to="/register">Зарегистрироваться</router-link>
        </p>
      </form>
    </BaseCard>
  </AuthLayout>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useAuthStore} from '@/stores';
import {AuthLayout} from '@/components/layout';
import {BaseAlert, BaseButton, BaseCard, BaseInput} from '@/components/ui';
import {Github} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const oauthError = ref('');
const isProcessingCallback = ref(false);

const oauthErrorMessage = computed(() => {
  const errors: Record<string, string> = {
    auth_failed: 'Ошибка авторизации через GitHub',
    link_failed: 'Ошибка привязки GitHub аккаунта',
    token_generation_failed: 'Ошибка генерации токена',
    invalid_link_state: 'Недействительное состояние привязки',
  };
  return errors[oauthError.value] || 'Произошла ошибка';
});

onMounted(async () => {
  // Check for OAuth token in URL (GitHub Login/Link success)
  const token = route.query.token as string;
  if (token) {
    isProcessingCallback.value = true;
    try {
      await authStore.handleGitHubCallback(token);
      if (authStore.isAuthenticated) {
        // Check for return URL (e.g. from failed link attempt landing on login)
        const returnUrl = sessionStorage.getItem('auth_return_url');
        sessionStorage.removeItem('auth_return_url');

        const redirect = route.query.redirect as string;
        router.push(returnUrl || redirect || '/reviews');
      } else {
        oauthError.value = 'auth_failed';
        isProcessingCallback.value = false;
      }
    } catch (e) {
      oauthError.value = 'auth_failed';
      isProcessingCallback.value = false;
    }
    // Clean URL
    router.replace({query: {}});
    return;
  }

  // Check for OAuth error in URL
  if (route.query.error) {
    oauthError.value = route.query.error as string;
    // Clean URL
    router.replace({query: {}});
  }
});

async function handleSubmit() {
  errorMessage.value = '';

  if (!email.value || !password.value) {
    errorMessage.value = 'Заполните все поля';
    return;
  }

  const success = await authStore.login(email.value, password.value);

  if (success) {
    const redirect = route.query.redirect as string;
    router.push(redirect || '/reviews');
  } else {
    errorMessage.value = authStore.error || 'Ошибка входа';
  }
}

function handleGitHubLogin() {
  authStore.loginWithGitHub();
}
</script>

<style scoped src="./LoginView.styles.css"></style>
