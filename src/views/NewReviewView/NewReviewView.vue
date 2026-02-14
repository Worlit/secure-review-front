<template>
  <div class="new-review-page">
    <div class="new-review-page__header">
      <router-link to="/reviews" class="new-review-page__back">
        <ArrowLeft :size="20"/>
        Назад к списку
      </router-link>
      <h1 class="new-review-page__title">Новый анализ кода</h1>
      <p class="new-review-page__subtitle">
        Отправьте код для проверки безопасности и оптимизации с помощью AI
      </p>
    </div>

    <BaseCard>
      <form @submit.prevent="handleSubmit" class="review-form">
        <BaseAlert
            v-if="reviewStore.error"
            variant="error"
            :show="true"
            dismissible
            @close="reviewStore.error = null">
          {{ reviewStore.error }}
        </BaseAlert>

        <div class="review-form__row">
          <div class="review-form__tabs">
            <button
                type="button"
                class="review-form__tab"
                :class="{ 'review-form__tab--active': mode === 'manual' }"
                @click="mode = 'manual'">
              Код вручную
            </button>
            <button
                type="button"
                class="review-form__tab"
                :class="{ 'review-form__tab--active': mode === 'github' }"
                @click="mode = 'github'">
              GitHub Репозиторий
            </button>
          </div>
        </div>

        <BaseInput
            v-model="title"
            label="Название"
            placeholder="Например: Проверка функции авторизации"
            :max-length="255"
            required/>


        <!-- Manual Mode -->
        <template v-if="mode === 'manual'">
          <div class="review-form__row">
            <div class="review-form__select-wrapper">
              <label class="review-form__label">Язык программирования</label>
              <BaseSelect
                  v-model="language"
                  :options="languageOptions"
                  placeholder="Выберите язык"/>
            </div>
          </div>

          <BaseTextarea
              v-model="code"
              label="Код для анализа"
              placeholder="Вставьте ваш код здесь..."
              :rows="16"
              monospace
              required/>
        </template>

        <!-- GitHub Mode -->
        <template v-else>
          <div v-if="!isGitHubConnected" class="review-form__connect-github">
            <p>Для анализа репозиториев необходимо подключить GitHub аккаунт.</p>
            <router-link to="/profile">
              <BaseButton variant="primary" size="sm">Перейти в профиль</BaseButton>
            </router-link>
          </div>
          <div v-else>
            <div class="review-form__row">
              <div class="review-form__select-wrapper">
                <label class="review-form__label">Репозиторий</label>
                <div v-if="isLoadingRepos" class="review-form__loading-text">
                  Загрузка репозиториев...
                </div>
                <BaseSelect
                    v-else
                    v-model="selectedRepo"
                    :options="repoOptions"
                    placeholder="Выберите репозиторий"/>
              </div>
            </div>

            <div class="review-form__row" v-if="selectedRepo">
              <div class="review-form__select-wrapper">
                <label class="review-form__label">Ветка</label>
                <div v-if="isLoadingBranches" class="review-form__loading-text">
                  Загрузка веток...
                </div>
                <BaseSelect
                    v-else
                    v-model="selectedBranch"
                    :options="branchOptions"
                    placeholder="Выберите ветку"/>
              </div>
            </div>
          </div>
        </template>

        <!-- Common: Custom Prompt -->
        <div v-if="mode === 'manual' || (mode === 'github' && isGitHubConnected)">
          <BaseTextarea
              v-model="customPrompt"
              label="Запрос пользователя / Инструкции"
              placeholder="Опишите, на что обратить внимание при анализе..."
              :rows="5"/>
        </div>

        <div class="review-form__hints">
          <h4>Что проверяет AI:</h4>
          <ul>
            <li>🔒 Уязвимости безопасности (SQL Injection, XSS, CSRF и др.)</li>
            <li>📝 Качество и читаемость кода</li>
            <li>⚡ Производительность и оптимизация</li>
            <li>🐛 Потенциальные баги и ошибки</li>
            <li>🏗️ Архитектурные рекомендации</li>
          </ul>
        </div>

        <div class="review-form__actions">
          <router-link to="/reviews">
            <BaseButton variant="secondary" type="button"> Отмена</BaseButton>
          </router-link>
          <BaseButton
              type="submit"
              variant="primary"
              size="lg"
              :loading="reviewStore.isCreating"
              :disabled="!isValid">
            <ShieldCheck :size="20"/>
            Начать анализ
          </BaseButton>
        </div>
      </form>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import {useRouter} from 'vue-router';
import {useAuthStore, useReviewStore} from '@/stores';
import {BaseAlert, BaseButton, BaseCard, BaseInput, BaseSelect, BaseTextarea,} from '@/components/ui';
import {githubApi} from '@/api';
import type {GitHubRepository} from '@/types/models/github';
import {ArrowLeft, ShieldCheck} from 'lucide-vue-next';

const router = useRouter();
const reviewStore = useReviewStore();
const authStore = useAuthStore();

const mode = ref<'manual' | 'github'>('manual');
const title = ref('');
const code = ref('');
const language = ref('');
const customPrompt = ref('');

// GitHub State
const repos = ref<GitHubRepository[]>([]);
const branches = ref<string[]>([]);
const selectedRepo = ref(''); // "owner/name"
const selectedBranch = ref('');
const isLoadingRepos = ref(false);
const isLoadingBranches = ref(false);

const isGitHubConnected = computed(() => !!authStore.user?.github_login);

const languageOptions = [
  {value: 'python', label: 'Python'},
  {value: 'javascript', label: 'JavaScript'},
  {value: 'typescript', label: 'TypeScript'},
  {value: 'go', label: 'Go'},
  {value: 'java', label: 'Java'},
  {value: 'csharp', label: 'C#'},
  {value: 'cpp', label: 'C++'},
  {value: 'c', label: 'C'},
  {value: 'rust', label: 'Rust'},
  {value: 'php', label: 'PHP'},
  {value: 'ruby', label: 'Ruby'},
  {value: 'swift', label: 'Swift'},
  {value: 'kotlin', label: 'Kotlin'},
  {value: 'sql', label: 'SQL'},
  {value: 'html', label: 'HTML'},
  {value: 'css', label: 'CSS'},
  {value: 'shell', label: 'Shell/Bash'},
  {value: 'yaml', label: 'YAML'},
  {value: 'json', label: 'JSON'},
  {value: 'other', label: 'Другой'},
];


const repoOptions = computed(() => {
  return repos.value.map((repo) => ({
    value: repo.full_name,
    label: repo.full_name,
  }));
});

const branchOptions = computed(() => {
  return branches.value.map((branch) => ({
    value: branch,
    label: branch,
  }));
});

const isValid = computed(() => {
  if (!title.value.trim()) return false;

  if (mode.value === 'manual') {
    return !!code.value.trim();
  } else {
    return !!selectedRepo.value && !!selectedBranch.value;
  }
});

// Fetch Repos
const fetchRepos = async () => {
  if (!isGitHubConnected.value) return;
  isLoadingRepos.value = true;
  try {
    repos.value = await githubApi.listRepositories();
  } catch (e) {
    console.error('Failed to fetch repos', e);
    reviewStore.error = 'Failed to load repositories';
  } finally {
    isLoadingRepos.value = false;
  }
};

// Watch mode to fetch repos
watch(mode, (newMode) => {
  if (newMode === 'github' && repos.value.length === 0) {
    fetchRepos();
  }
});

// Watch selectedRepo to fetch branches
watch(selectedRepo, async (newRepo) => {
  selectedBranch.value = '';
  branches.value = [];
  if (!newRepo) return;

  const [owner, name] = newRepo.split('/');
  if (!owner || !name) return;

  isLoadingBranches.value = true;
  try {
    branches.value = await githubApi.listBranches(owner, name);
    // Auto-select 'main' or 'master' if available
    if (branches.value.includes('main')) selectedBranch.value = 'main';
    else if (branches.value.includes('master')) selectedBranch.value = 'master';
    else if (branches.value.length > 0) {
      const first = branches.value[0];
      if (first) selectedBranch.value = first;
    }
  } catch (e) {
    console.error('Failed to fetch branches', e);
    reviewStore.error = 'Failed to load branches';
  } finally {
    isLoadingBranches.value = false;
  }
});

const handleSubmit = async () => {
  if (!isValid.value) return;

  try {
    let review;
    if (mode.value === 'manual') {
      review = await reviewStore.createReview({
        title: title.value.trim(),
        code: code.value,
        language: language.value || 'other',
        custom_prompt: customPrompt.value || undefined,
      });
    } else {
      const parts = selectedRepo.value.split('/');
      if (parts.length < 2) return;

      const owner = parts[0];
      const name = parts[1];

      review = await reviewStore.createReview({
        title: title.value.trim(),
        repo_owner: owner,
        repo_name: name,
        repo_branch: selectedBranch.value,
        custom_prompt: customPrompt.value || undefined,
        // language is optional, backend handles it for repos
      });
    }

    if (review) {
      if (reviewStore.pollReviewStatus) {
        reviewStore.pollReviewStatus(review.id);
      }
      router.push(`/reviews/${review.id}`);
    }
  } catch (e) {
    // Error handled in store
  }
};

onMounted(() => {
  // Clear error on mount
  reviewStore.error = null;
});
</script>

<style scoped src="./NewReviewView.styles.css"></style>
