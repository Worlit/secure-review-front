import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'
import {useAuthStore} from '@/stores'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/reviews',
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/LoginView/LoginView.vue'),
        meta: {guest: true},
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('@/views/RegisterView/RegisterView.vue'),
        meta: {guest: true},
    },
    {
        path: '/profile',
        name: 'profile',
        component: () => import('@/views/ProfileView/ProfileView.vue'),
        meta: {requiresAuth: true},
    },
    {
        path: '/reviews',
        name: 'reviews',
        component: () => import('@/views/ReviewsView/ReviewsView.vue'),
        meta: {requiresAuth: true},
    },
    {
        path: '/reviews/new',
        name: 'new-review',
        component: () => import('@/views/NewReviewView/NewReviewView.vue'),
        meta: {requiresAuth: true},
    },
    {
        path: '/reviews/:id',
        name: 'review-detail',
        component: () => import('@/views/ReviewDetailView/ReviewDetailView.vue'),
        meta: {requiresAuth: true},
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        redirect: '/reviews',
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Navigation guards
router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore()

    // Handle GitHub OAuth callback for login
    if (to.path === '/login' && to.query.token) {
        await authStore.handleGitHubCallback(to.query.token as string)
        next('/reviews')
        return
    }

    // Handle GitHub link callback - пользователь уже авторизован
    if (to.path === '/profile' && to.query.status === 'github_linked') {
        // Refresh profile to get updated GitHub info
        if (authStore.token) {
            await authStore.fetchProfile()
        }
        next({path: '/profile', query: {}})
        return
    }

    // Handle errors from OAuth
    if (to.path === '/login' && to.query.error) {
        // Error will be handled by the login page
        next()
        return
    }

    // Initialize auth if we have a token but no user
    if (authStore.token && !authStore.user) {
        await authStore.init()
    }

    // Check if route requires auth - use token presence, not full auth state
    if (to.meta.requiresAuth && !authStore.token) {
        next({name: 'login', query: {redirect: to.fullPath}})
        return
    }

    // Check if route is for guests only
    if (to.meta.guest && authStore.token) {
        next('/reviews')
        return
    }

    next()
})

export default router
