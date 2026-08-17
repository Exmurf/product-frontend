import type {
  UserRole,
} from '../../domain/entities/CurrentUser'

export interface UserSessionStorage {
  saveUserEmail(
    email: string,
  ): void

  getUserEmail():
    string | null

  saveUserRole(
    role: UserRole,
  ): void

  getUserRole():
    UserRole | null

  clearUser(): void
}