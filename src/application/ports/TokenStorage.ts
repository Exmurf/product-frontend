export interface TokenStorage {
  saveAccessToken(token: string): void

  saveRefreshToken(
    token: string | null,
  ): void

  getAccessToken(): string | null

  getRefreshToken(): string | null

  clearTokens(): void
}