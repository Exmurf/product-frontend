import type {
  UserSessionStorage,
} from '../../application/ports/UserSessionStorage'

import type {
  UserRole,
} from '../../domain/entities/CurrentUser'


const USER_EMAIL_KEY =
  'current_user_email'

const USER_ROLE_KEY =
  'current_user_role'


export class SessionStorageUserSessionStorage
  implements UserSessionStorage
{
  saveUserEmail(
    email: string,
  ): void {
    sessionStorage.setItem(
      USER_EMAIL_KEY,
      email,
    )
  }

  getUserEmail():
    string | null {
    return sessionStorage.getItem(
      USER_EMAIL_KEY,
    )
  }

  saveUserRole(
    role: UserRole,
  ): void {
    sessionStorage.setItem(
      USER_ROLE_KEY,
      role,
    )
  }

  getUserRole():
    UserRole | null {
    const storedRole =
      sessionStorage.getItem(
        USER_ROLE_KEY,
      )

    if (
      storedRole === 'user' ||
      storedRole === 'admin'
    ) {
      return storedRole
    }

    return null
  }

  clearUser(): void {
    sessionStorage.removeItem(
      USER_EMAIL_KEY,
    )

    sessionStorage.removeItem(
      USER_ROLE_KEY,
    )
  }
}