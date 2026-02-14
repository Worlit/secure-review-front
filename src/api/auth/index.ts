import {apiClient} from '../core/client'
import type {AuthResponse, GitHubAuthURL, LoginInput, RegisterInput} from '@/types'

export const authApi = {
    /**
     * Register a new user
     */
    async register(input: RegisterInput): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/register', input)
        return response.data
    },

    /**
     * Login user with email and password
     */
    async login(input: LoginInput): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/login', input)
        return response.data
    },

    /**
     * Refresh the access token
     */
    async refreshToken(): Promise<{ token: string }> {
        const response = await apiClient.post<{ token: string }>('/auth/refresh')
        return response.data
    },

    /**
     * Change password
     */
    async changePassword(oldPassword: string, newPassword: string): Promise<void> {
        await apiClient.post('/auth/change-password', {
            old_password: oldPassword,
            new_password: newPassword,
        })
    },

    /**
     * Get GitHub OAuth URL
     * If user is authenticated, it will be for linking account
     */
    async getGitHubAuthURL(): Promise<GitHubAuthURL> {
        const response = await apiClient.get<GitHubAuthURL>('/auth/github')
        return response.data
    },

    /**
     * Unlink GitHub account from user (requires auth)
     */
    async unlinkGitHub(): Promise<{ message: string }> {
        const response = await apiClient.delete<{ message: string }>('/auth/github/link')
        return response.data
    },
}
