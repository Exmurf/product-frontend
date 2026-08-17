import type {
  TokenStorage,
} from '../../application/ports/TokenStorage'


const ACCESS_TOKEN_KEY =
  'access_token'


const REFRESH_TOKEN_KEY =
  'refresh_token'


export class LocalStorageTokenStorage
  implements TokenStorage
{
  saveAccessToken(
    token: string,
  ): void {
    localStorage.setItem(
      ACCESS_TOKEN_KEY,
      token,
    )
  }

  saveRefreshToken(
    token: string | null,
  ): void {
    if (token === null) {
      localStorage.removeItem(
        REFRESH_TOKEN_KEY,
      )

      return
    }

    localStorage.setItem(
      REFRESH_TOKEN_KEY,
      token,
    )
  }

  getAccessToken(): string | null {
    return localStorage.getItem(
      ACCESS_TOKEN_KEY,
    )
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(
      REFRESH_TOKEN_KEY,
    )
  }

  clearTokens(): void {
    localStorage.removeItem(
      ACCESS_TOKEN_KEY,
    )

    localStorage.removeItem(
      REFRESH_TOKEN_KEY,
    )
  }
}
