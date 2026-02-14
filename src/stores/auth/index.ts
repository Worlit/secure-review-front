import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { authApi, usersApi, setAuthToken, clearAuthToken, getAuthToken } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(getAuthToken())
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Separate loading states for different actions
  const isProfileLoading = ref(false)
  const isGitHubLoading = ref(false)
  const isPasswordLoading = ref(false)

  // New specific loading states to avoid shared spinners
  const isLoggingIn = ref(false)
  const isRegistering = ref(false)
  const isGitHubLoggingIn = ref(false)

  // isAuthenticated now only checks token - user will be loaded
  const isAuthenticated = computed(() => !!token.value)
  const isFullyLoaded = computed(() => !!token.value && !!user.value)
  const hasGitHub = computed(() => !!user.value?.github_login)

  async function register(username: string, email: string, password: string) {
    isLoading.value = true
    isRegistering.value = true
    error.value = null
    try {
      const response = await authApi.register({ username, email, password })
      token.value = response.token
      user.value = response.user
      setAuthToken(response.token)
      return true
    } catch (e: any) {
      error.value = e.response?.data?.error || 'Ошибка регистрации'
      return false
    } finally {
      isLoading.value = false
      isRegistering.value = false
    }
  }

  async function login(email: string, password: string) {
    isLoading.value = true
    isLoggingIn.value = true
    error.value = null
    try {
      const response = await authApi.login({ email, password })
      token.value = response.token
      user.value = response.user
      setAuthToken(response.token)
      return true
    } catch (e: any) {
      error.value = e.response?.data?.error || 'Неверный email или пароль'
      return false
    } finally {
      isLoading.value = false
      isLoggingIn.value = false
    }
  }

  async function loginWithGitHub() {
    isLoading.value = true
    isGitHubLoggingIn.value = true
    error.value = null
    try {
      const { url } = await authApi.getGitHubAuthURL()
      window.location.href = url
    } catch (e: any) {
      error.value = e.response?.data?.error || 'Ошибка авторизации через GitHub'
      isLoading.value = false
      isGitHubLoggingIn.value = false
    }
  }

  async function handleGitHubCallback(urlToken: string) {
    token.value = urlToken
    setAuthToken(urlToken)
    await fetchProfile()
  }

  async function fetchProfile() {
    if (!token.value) return
    isProfileLoading.value = true
    try {
      user.value = await usersApi.getProfile()
    } catch (e: any) {
      // Token invalid - logout
      logout()
    } finally {
      isProfileLoading.value = false
    }
  }

  async function updateProfile(data: { username?: string; avatar_url?: string }) {
    isProfileLoading.value = true
    error.value = null
    try {
      user.value = await usersApi.updateProfile(data)
      return true
    } catch (e: any) {
      error.value = e.response?.data?.error || 'Ошибка обновления профиля'
      return false
    } finally {
      isProfileLoading.value = false
    }
  }

  async function linkGitHub() {
    isGitHubLoading.value = true
    error.value = null
    // Save return URL for better UX if the redirect goes to /login instead of /profile
    sessionStorage.setItem('auth_return_url', '/profile')
    try {
      // Get GitHub auth URL with current token (for linking)
      const { url } = await authApi.getGitHubAuthURL()
      window.location.href = url
    } catch (e: any) {
      error.value = e.response?.data?.error || 'Ошибка привязки GitHub'
      isGitHubLoading.value = false
      sessionStorage.removeItem('auth_return_url')
    }
  }

  async function unlinkGitHub() {
    isGitHubLoading.value = true
    error.value = null
    try {
      await authApi.unlinkGitHub()
      if (user.value) {
        user.value = { ...user.value, github_login: null }
      }
      return true
    } catch (e: any) {
      error.value = e.response?.data?.error || 'Ошибка отвязки GitHub'
      return false
    } finally {
      isGitHubLoading.value = false
    }
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    isPasswordLoading.value = true
    error.value = null
    try {
      await authApi.changePassword(oldPassword, newPassword)
      return true
    } catch (e: any) {
      error.value = e.response?.data?.error || 'Ошибка смены пароля'
      return false
    } finally {
      isPasswordLoading.value = false
    }
  }

  async function deleteAccount() {
    isLoading.value = true
    error.value = null
    try {
      await usersApi.deleteAccount()
      logout()
      return true
    } catch (e: any) {
      error.value = e.response?.data?.error || 'Ошибка удаления аккаунта'
      return false
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    clearAuthToken()
  }

  // Initialize - check if we have a token and fetch profile
  async function init() {
    if (token.value) {
      await fetchProfile()
    }
  }

  return {
    // State
    user,
    token,
    isLoading,
    isProfileLoading,
    isGitHubLoading,
    isPasswordLoading,
    isLoggingIn,
    isRegistering,
    isGitHubLoggingIn,
    error,
    
    // Getters
    isAuthenticated,
    isFullyLoaded,
    hasGitHub,
    
    // Actions
    register,
    login,
    loginWithGitHub,
    handleGitHubCallback,
    fetchProfile,
    updateProfile,
    linkGitHub,
    unlinkGitHub,
    changePassword,
    deleteAccount,
    logout,
    init,
  }
})
