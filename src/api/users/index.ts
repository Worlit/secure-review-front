import { apiClient } from '../core/client'
import type { User, UpdateUserInput, GitHubRepository } from '@/types'

export const usersApi = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/users/me')
    return response.data
  },

  /**
   * Update current user profile
   */
  async updateProfile(input: UpdateUserInput): Promise<User> {
    const response = await apiClient.put<User>('/users/me', input)
    return response.data
  },

  /**
   * Delete current user account
   */
  async deleteAccount(): Promise<void> {
    await apiClient.delete('/users/me')
  },

  /**
   * Get user's GitHub repositories (requires GitHub connection)
   */
  async getRepositories(): Promise<GitHubRepository[]> {
    const response = await apiClient.get<GitHubRepository[]>('/users/repos')
    return response.data
  },
}
