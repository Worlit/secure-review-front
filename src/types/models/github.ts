/**
 * GitHub repository info
 */
export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string
  language: string | null
  private: boolean
}

/**
 * GitHub OAuth authorization URL response
 */
export interface GitHubAuthURL {
  url: string
  state: string
}
