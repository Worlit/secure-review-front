import {apiClient} from '../core/client'
import type {CodeReview, CreateReviewInput, ReviewListResponse} from '@/types'

export const reviewsApi = {
    /**
     * Create a new code review
     */
    async create(input: CreateReviewInput): Promise<CodeReview> {
        const response = await apiClient.post<CodeReview>('/reviews', input)
        return response.data
    },

    /**
     * Get a specific review by ID
     */
    async getById(id: string): Promise<CodeReview> {
        const response = await apiClient.get<CodeReview>(`/reviews/${id}`)
        return response.data
    },

    /**
     * Get list of user's reviews with pagination
     */
    async getList(page: number = 1, pageSize: number = 20): Promise<ReviewListResponse> {
        const response = await apiClient.get<ReviewListResponse>('/reviews', {
            params: {page, page_size: pageSize},
        })
        return response.data
    },

    /**
     * Delete a review
     */
    async delete(id: string): Promise<void> {
        await apiClient.delete(`/reviews/${id}`)
    },

    /**
     * Reanalyze a review
     */
    async reanalyze(id: string): Promise<CodeReview> {
        const response = await apiClient.post<CodeReview>(`/reviews/${id}/reanalyze`)
        return response.data
    },

    /**
     * Download review as PDF
     */
    async downloadPDF(id: string): Promise<Blob> {
        const response = await apiClient.get(`/reviews/${id}/pdf`, {
            responseType: 'blob',
        })
        return response.data
    },

    /**
     * Download review as Markdown
     */
    async downloadMarkdown(id: string): Promise<Blob> {
        const response = await apiClient.get(`/reviews/${id}/markdown`, {
            responseType: 'blob',
        })
        return response.data
    },
}
