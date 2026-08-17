import type { TokenStorage } from '../ports/TokenStorage'
import type { UserSessionStorage } from '../ports/UserSessionStorage'

export class LogoutUseCase {
  private tokenStorage:
    TokenStorage

  private userSessionStorage:
    UserSessionStorage

  constructor(
    tokenStorage: TokenStorage,
    userSessionStorage:
      UserSessionStorage,
  ) {
    this.tokenStorage =
      tokenStorage

    this.userSessionStorage =
      userSessionStorage
  }

  execute(): void {
    this.tokenStorage.clearTokens()

    this.userSessionStorage.clearUser()
  }
}