import {createApp} from 'vue'
import {createPinia} from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import logger from '@/utils/logger'

const app = createApp(App)

// Global Error Handler
app.config.errorHandler = (err, instance, info) => {
    logger.error('Global Vue Error', err, {info, component: instance?.$options.__name})
}

// Global Promise Rejection Handler
window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    const message = reason instanceof Error ? reason.message : String(reason || '')

    // Ignore known browser extension errors
    if (message.includes('The message port closed before a response was received')) {
        event.preventDefault()
        return
    }
    logger.error('Unhandled Promise Rejection', reason)
})

// Install Pinia
app.use(createPinia())

// Install Router
app.use(router)

// Mount app
app.mount('#app')
