import axios, {type AxiosError, type AxiosInstance} from 'axios'
import type {ApiError} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

export const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // For cookies
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem('access_token')
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export function setAuthToken(token: string) {
    localStorage.setItem('access_token', token)
}

export function clearAuthToken() {
    localStorage.removeItem('access_token')
}

export function getAuthToken(): string | null {
    return localStorage.getItem('access_token')
}
