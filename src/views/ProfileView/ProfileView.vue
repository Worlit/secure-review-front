<template>
  <div class="profile-page">
    <div class="profile-page__container">
      <h1 class="profile-page__title">Профиль</h1>

      <BaseAlert
          v-if="successMessage"
          variant="success"
          :show="true"
          dismissible
          @close="successMessage = ''">
        {{ successMessage }}
      </BaseAlert>

      <BaseAlert
          v-if="authStore.error"
          variant="error"
          :show="true"
          dismissible
          @close="authStore.error = null">
        {{ authStore.error }}
      </BaseAlert>

      <!-- Profile Info Card -->
      <BaseCard title="Информация профиля" class="profile-card">
        <form @submit.prevent="handleUpdateProfile" class="profile-form">
          <div class="profile-form__avatar">
            <img
                v-if="authStore.user?.avatar_url"
                :src="authStore.user.avatar_url"
                :alt="authStore.user.username"
                class="profile-form__avatar-img"/>
            <div v-else class="profile-form__avatar-placeholder">
              {{ authStore.user?.username?.charAt(0).toUpperCase() }}
            </div>
          </div>

          <div class="profile-form__fields">
            <BaseInput
                v-model="username"
                label="Имя пользователя"
                placeholder="Ваше имя"
                :disabled="authStore.isProfileLoading"/>

            <BaseInput
                :model-value="authStore.user?.email || ''"
                label="Email"
                type="email"
                disabled
                hint="Email нельзя изменить"/>
          </div>

          <div class="profile-form__actions">
            <BaseButton type="submit" variant="primary" :loading="authStore.isProfileLoading">
              Сохранить изменения
            </BaseButton>
          </div>
        </form>
      </BaseCard>

      <!-- GitHub Connection Card -->
      <BaseCard title="Подключение GitHub" class="profile-card">
        <div class="github-section">
          <div v-if="authStore.hasGitHub" class="github-section__connected">
            <div class="github-section__info">
              <Github :size="24" class="github-section__icon"/>
              <div>
                <p class="github-section__login">@{{ authStore.user?.github_login }}</p>
                <p class="github-section__status">GitHub аккаунт подключен</p>
              </div>
            </div>
            <BaseButton
                variant="danger"
                @click="handleUnlinkGitHub"
                :loading="authStore.isGitHubLoading">
              Отключить
            </BaseButton>
          </div>
          <div v-else class="github-section__disconnected">
            <p class="github-section__description">
              Подключите GitHub для быстрого входа и доступа к вашим репо��иториям
            </p>
            <BaseButton
                variant="github"
                @click="handleLinkGitHub"
                :loading="authStore.isGitHubLoading">
              <Github :size="20"/>
              Подключить GitHub
            </BaseButton>
          </div>
        </div>
      </BaseCard>

      <!-- Change Password Card -->
      <BaseCard title="Изменить пароль" class="profile-card">
        <form @submit.prevent="handleChangePassword" class="password-form">
          <div class="password-form__fields">
            <BaseInput
                v-model="oldPassword"
                type="password"
                label="Текущий пароль"
                placeholder="Введите текущий пароль"
                autocomplete="current-password"/>
            <BaseInput
                v-model="newPassword"
                type="password"
                label="Новый пароль"
                placeholder="Минимум 8 символов"
                autocomplete="new-password"
                :error="newPasswordError"/>
            <BaseInput
                v-model="confirmNewPassword"
                type="password"
                label="Подтвердите пароль"
                placeholder="Повторите новый пароль"
                autocomplete="new-password"
                :error="confirmNewPasswordError"/>
          </div>
          <div class="password-form__actions">
            <BaseButton
                type="submit"
                variant="secondary"
                :loading="authStore.isPasswordLoading"
                :disabled="!canChangePassword">
              Изменить пароль
            </BaseButton>
          </div>
        </form>
      </BaseCard>

      <!-- Danger Zone Card -->
      <BaseCard title="Опасная зона" class="profile-card profile-card--danger">
        <div class="danger-zone">
          <p class="danger-zone__description">
            После удаления аккаунта все данные будут безвозвратно утеряны.
          </p>
          <BaseButton variant="danger" @click="handleDeleteAccount" :loading="authStore.isLoading">
            Удалить аккаунт
          </BaseButton>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useAuthStore} from '@/stores';
import {BaseAlert, BaseButton, BaseCard, BaseInput} from '@/components/ui';
import {Github} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const avatarUrl = ref('');
const oldPassword = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');
const successMessage = ref('');

// Initialize form values
onMounted(async () => {
  if (authStore.user) {
    username.value = authStore.user.username;
    avatarUrl.value = authStore.user.avatar_url || '';
  }

  // Check for GitHub link success
  if (route.query.status === 'github_linked') {
    successMessage.value = 'GitHub аккаунт успешно привязан!';
    // Refresh profile to show linked account status immediately
    await authStore.fetchProfile();

    // Clean URL preserving other params
    const newQuery = {...route.query};
    delete newQuery.status;
    router.replace({query: newQuery});
  }
});

watch(
    () => authStore.user,
    (user) => {
      if (user) {
        username.value = user.username;
        avatarUrl.value = user.avatar_url || '';
      }
    }
);

// Password validation
const newPasswordError = computed(() => {
  if (newPassword.value && newPassword.value.length < 8) {
    return 'Минимум 8 символов';
  }
  return '';
});

const confirmNewPasswordError = computed(() => {
  if (confirmNewPassword.value && confirmNewPassword.value !== newPassword.value) {
    return 'Пароли не совпадают';
  }
  return '';
});

const canChangePassword = computed(() => {
  return (
      oldPassword.value &&
      newPassword.value &&
      confirmNewPassword.value &&
      !newPasswordError.value &&
      !confirmNewPasswordError.value
  );
});

async function handleUpdateProfile() {
  const data: { username?: string; avatar_url?: string } = {};

  if (username.value !== authStore.user?.username) {
    data.username = username.value;
  }
  if (avatarUrl.value !== authStore.user?.avatar_url) {
    data.avatar_url = avatarUrl.value || undefined;
  }

  if (Object.keys(data).length === 0) {
    return;
  }

  const success = await authStore.updateProfile(data);
  if (success) {
    successMessage.value = 'Профиль обновлен';
  }
}

function handleLinkGitHub() {
  authStore.linkGitHub();
}

async function handleUnlinkGitHub() {
  if (confirm('Вы уверены, что хотите отключить GitHub?')) {
    const success = await authStore.unlinkGitHub();
    if (success) {
      successMessage.value = 'GitHub аккаунт отключен';
    }
  }
}

async function handleChangePassword() {
  if (!canChangePassword.value) return;

  const success = await authStore.changePassword(oldPassword.value, newPassword.value);
  if (success) {
    successMessage.value = 'Пароль изменен';
    oldPassword.value = '';
    newPassword.value = '';
    confirmNewPassword.value = '';
  }
}

async function handleDeleteAccount() {
  if (confirm('Вы уверены, что хотите удалить аккаунт? Это действие необратимо.')) {
    if (confirm('После��нее предупреждение! Все ваши данные будут удалены.')) {
      await authStore.deleteAccount();
    }
  }
}
</script>

<style scoped src="./ProfileView.styles.css"></style>
