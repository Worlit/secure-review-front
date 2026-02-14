<template>
  <div class="reviews-page">
    <div class="reviews-page__header">
      <div>
        <h1 class="reviews-page__title">Code Reviews</h1>
        <p class="reviews-page__subtitle">Анализ безопасности вашего кода</p>
      </div>
      <router-link to="/reviews/new">
        <BaseButton variant="primary" size="lg">
          <Plus :size="20" />
          Новый анализ
        </BaseButton>
      </router-link>
    </div>

    <!-- Stats -->
    <div class="reviews-stats">
      <div class="reviews-stats__item">
        <span class="reviews-stats__value">{{ reviewStore.total }}</span>
        <span class="reviews-stats__label">Всего reviews</span>
      </div>
      <div class="reviews-stats__item reviews-stats__item--success">
        <span class="reviews-stats__value">{{ reviewStore.stats.completedCount }}</span>
        <span class="reviews-stats__label">Завершено</span>
      </div>
      <div class="reviews-stats__item reviews-stats__item--warning">
        <span class="reviews-stats__value">{{ reviewStore.stats.highCount }}</span>
        <span class="reviews-stats__label">High issues</span>
      </div>
      <div class="reviews-stats__item reviews-stats__item--danger">
        <span class="reviews-stats__value">{{ reviewStore.stats.criticalCount }}</span>
        <span class="reviews-stats__label">Critical issues</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="reviewStore.isFetching && !reviewStore.reviews.length" class="reviews-loading">
      <BaseLoader text="Загрузка reviews..." />
    </div>

    <!-- Empty State -->
    <div v-else-if="!reviewStore.reviews.length" class="reviews-empty">
      <FileText :size="64" :stroke-width="1.5" />
      <h2>Нет code reviews</h2>
      <p>Создайте первый анализ для проверки безопасности вашего кода</p>
      <router-link to="/reviews/new">
        <BaseButton variant="primary">Создать первый анализ</BaseButton>
      </router-link>
    </div>

    <!-- Reviews List -->
    <div v-else class="reviews-list">
      <div
        v-for="review in reviewStore.reviews"
        :key="review.id"
        class="review-item"
        @click="navigateToReview(review.id)">
        <div class="review-item__header">
          <h3 class="review-item__title">{{ review.title }}</h3>
          <div class="review-item__actions">
            <BaseBadge :variant="getStatusVariant(review.status)">
              {{ getStatusLabel(review.status) }}
            </BaseBadge>
            <button
              class="delete-btn"
              @click.stop="handleDelete(review)"
              title="Удалить review"
              :disabled="reviewStore.isDeleting">
              <Trash2 :size="18" />
            </button>
          </div>
        </div>

        <div class="review-item__meta">
          <BaseBadge variant="default">{{ review.language }}</BaseBadge>
          <span class="review-item__date">
            {{ formatDate(review.created_at) }}
          </span>
        </div>

        <div v-if="review.security_issues?.length" class="review-item__issues">
          <span
            v-for="severity in getIssuesSummary(review.security_issues)"
            :key="severity.type"
            :class="['review-item__issue-count', `review-item__issue-count--${severity.type}`]">
            {{ severity.count }} {{ severity.label }}
          </span>
        </div>

        <pre v-if="review.code" class="review-item__code">{{ truncateCode(review.code) }}</pre>
      </div>

      <!-- Pagination -->
      <div v-if="reviewStore.totalPages > 1" class="reviews-pagination">
        <BaseButton
          variant="secondary"
          :disabled="reviewStore.currentPage <= 1"
          @click="loadPage(reviewStore.currentPage - 1)">
          Назад
        </BaseButton>
        <span class="reviews-pagination__info">
          Страница {{ reviewStore.currentPage }} из {{ reviewStore.totalPages }}
        </span>
        <BaseButton
          variant="secondary"
          :disabled="!reviewStore.hasMore"
          @click="loadPage(reviewStore.currentPage + 1)">
          Вперед
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useReviewStore } from '@/stores';
import type { ReviewStatus, SecurityIssue, SecuritySeverity, CodeReview } from '@/types';
import { BaseButton, BaseBadge, BaseLoader } from '@/components/ui';
import { Plus, FileText, Trash2 } from 'lucide-vue-next';

const router = useRouter();
const reviewStore = useReviewStore();

onMounted(() => {
  reviewStore.fetchReviews();
});

async function handleDelete(review: CodeReview) {
  if (confirm(`Вы уверены, что хотите удалить review "${review.title}"?`)) {
    const success = await reviewStore.deleteReview(review.id);
    if (success) {
      if (reviewStore.reviews.length === 0 && reviewStore.currentPage > 1) {
        reviewStore.fetchReviews(reviewStore.currentPage - 1);
      } else if (reviewStore.reviews.length === 0) {
        reviewStore.fetchReviews(1);
      }
    }
  }
}

function navigateToReview(id: string) {
  router.push(`/reviews/${id}`);
}

function loadPage(page: number) {
  reviewStore.fetchReviews(page);
}

function getStatusVariant(
  status: ReviewStatus
): 'default' | 'primary' | 'success' | 'warning' | 'danger' {
  const variants: Record<ReviewStatus, 'default' | 'primary' | 'success' | 'warning' | 'danger'> = {
    pending: 'default',
    processing: 'primary',
    completed: 'success',
    failed: 'danger',
  };
  return variants[status];
}

function getStatusLabel(status: ReviewStatus): string {
  const labels: Record<ReviewStatus, string> = {
    pending: 'Ожидает',
    processing: 'Анализ...',
    completed: 'Завершен',
    failed: 'Ошибка',
  };
  return labels[status];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateCode(code: string, maxLength: number = 150): string {
  if (code.length <= maxLength) return code;
  return code.slice(0, maxLength) + '...';
}

function getIssuesSummary(issues: SecurityIssue[]) {
  const counts: Record<SecuritySeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  issues.forEach((issue) => {
    counts[issue.severity]++;
  });

  const labels: Record<SecuritySeverity, string> = {
    critical: 'critical',
    high: 'high',
    medium: 'medium',
    low: 'low',
    info: 'info',
  };

  return Object.entries(counts)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({
      type: type as SecuritySeverity,
      count,
      label: labels[type as SecuritySeverity],
    }));
}
</script>

<style scoped src="./ReviewsView.styles.css"></style>
