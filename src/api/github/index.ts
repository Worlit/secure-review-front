import {apiClient} from '../core/client'
import type {GitHubRepository} from '@/types/models/github'

export const githubApi = {
    listRepositories: async (): Promise<GitHubRepository[]> => {
        const {data} = await apiClient.get<GitHubRepository[]>('/github/repos')
        return data
    },

    listBranches: async (owner: string, repo: string): Promise<string[]> => {
        const {data} = await apiClient.get<string[]>(`/github/repos/${owner}/${repo}/branches`)
        return data
    },
}
