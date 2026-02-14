/**
 * Status of a code review
 */
export type ReviewStatus = 'pending' | 'processing' | 'completed' | 'failed'

/**
 * Severity level of a security issue
 */
export type SecuritySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'

/**
 * Security issue found during code review
 */
export interface SecurityIssue {
  id: string
  review_id: string
  severity: SecuritySeverity
  title: string
  description: string
  file_path?: string | null
  line_start?: number | null
  line_end?: number | null
  suggestion: string
  cwe?: string | null
  code_snippet?: string | null
  created_at: string
}

/**
 * Code review response from API
 */
export interface CodeReview {
  id: string
  user_id: string
  title: string
  code?: string
  language: string
  status: ReviewStatus
  result?: string | null
  custom_prompt?: string | null
  security_issues?: SecurityIssue[]
  overall_score: number
  summary?: string
  suggestions?: string[]
  created_at: string
  completed_at?: string | null
}

/**
 * Input for creating a new code review
 */
export interface CreateReviewInput {
  title: string
  code?: string
  language?: string
  repo_owner?: string
  repo_name?: string
  repo_branch?: string
  custom_prompt?: string
}

/**
 * Paginated response for reviews list
 */
export interface ReviewListResponse {
  reviews: CodeReview[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
