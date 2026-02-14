/**
 * User entity
 */
export interface User {
  id: string
  email: string
  username: string
  github_login?: string | null
  avatar_url?: string | null
  is_active: boolean
  created_at: string
}

/**
 * Input for user login
 */
export interface LoginInput {
  email: string
  password: string
}

/**
 * Input for user registration
 */
export interface RegisterInput {
  username: string
  email: string
  password: string
}

/**
 * Input for updating user profile
 */
export interface UpdateUserInput {
  username?: string
  avatar_url?: string
}
