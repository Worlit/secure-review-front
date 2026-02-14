<template>
  <header class="header">
    <div class="header__container">
      <router-link to="/reviews" class="header__logo">
        <ShieldCheck :size="28" :stroke-width="2"/>
        <span>Secure Review</span>
      </router-link>

      <nav v-if="isAuthenticated" class="header__nav">
        <router-link to="/reviews" class="header__link"> Reviews</router-link>
        <router-link to="/reviews/new" class="header__link header__link--primary">
          + Новый анализ
        </router-link>
      </nav>

      <div v-if="isAuthenticated" class="header__user">
        <router-link to="/profile" class="header__profile">
          <img
              v-if="user?.avatar_url"
              :src="user.avatar_url"
              :alt="user.username"
              class="header__avatar"/>
          <div v-else class="header__avatar header__avatar--placeholder">
            {{ user?.username?.charAt(0).toUpperCase() }}
          </div>
          <span class="header__username">{{ user?.username }}</span>
        </router-link>
        <button class="header__logout" @click="handleLogout" title="Выйти">
          <LogOut :size="20" :stroke-width="2"/>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {useRouter} from 'vue-router';
import {useAuthStore} from '@/stores';
import {LogOut, ShieldCheck} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style scoped src="./AppHeader.styles.css"></style>
