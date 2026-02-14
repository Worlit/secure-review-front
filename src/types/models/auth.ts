import type { User } from './user'

/**
 * Authentication response with token and user data
 */
export interface AuthResponse {
  token: string
  user: User
}
