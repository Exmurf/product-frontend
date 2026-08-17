import type { TokenStorage } from '../../application/ports/TokenStorage'

interface RefreshTokenApiResponse {
  status: boolean

  data?: {
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
  }

  message?: string
}

export class AuthenticatedHttpClient {
  private baseUrl: string

  private tokenStorage:
    TokenStorage

  private onAuthenticationFailed:
    () => void

  private refreshPromise:
    Promise<void> | null =
    null

  constructor(
    baseUrl: string,
    tokenStorage: TokenStorage,
    onAuthenticationFailed:
      () => void,
  ) {
    this.baseUrl =
      baseUrl

    this.tokenStorage =
      tokenStorage

    this.onAuthenticationFailed =
      onAuthenticationFailed
  }

  async request(
    path: string,
    options: RequestInit = {},
  ): Promise<Response> {
    if (
      this.tokenStorage
        .getAccessToken() === null
    ) {
      await this.refreshAccessToken()
    }

    const firstResponse =
      await this.sendRequest(
        path,
        options,
      )

    if (
      firstResponse.status !== 401
    ) {
      return firstResponse
    }

    await this.refreshAccessToken()

    const retryResponse =
      await this.sendRequest(
        path,
        options,
      )

    return retryResponse
  }

  private async sendRequest(
    path: string,
    options: RequestInit,
  ): Promise<Response> {
    const accessToken =
      this.tokenStorage
        .getAccessToken()

    if (accessToken === null) {
      this.authenticationFailed(
        'Access token bulunamadı',
      )
    }

    const headers =
      new Headers(
        options.headers,
      )

    headers.set(
      'Authorization',
      `Bearer ${accessToken}`,
    )

    return await fetch(
      `${this.baseUrl}${path}`,
      {
        ...options,
        headers,
      },
    )
  }

  private async refreshAccessToken():
    Promise<void> {
    /*
      Aynı anda birden fazla request
      401 alırsa hepsinin ayrı ayrı
      refresh request atmasını
      istemiyoruz.

      İlk refresh devam ediyorsa
      diğerleri aynı Promise'i
      bekliyor.
    */

    if (
      this.refreshPromise !== null
    ) {
      await this.refreshPromise

      return
    }

    const currentRefreshPromise =
      this.performRefresh()

    this.refreshPromise =
      currentRefreshPromise

    try {
      await currentRefreshPromise
    } finally {
      if (
        this.refreshPromise ===
        currentRefreshPromise
      ) {
        this.refreshPromise =
          null
      }
    }
  }

  private async performRefresh():
    Promise<void> {
    const refreshToken =
      this.tokenStorage
        .getRefreshToken()

    if (refreshToken === null) {
      this.authenticationFailed(
        'Oturum süresi doldu. Tekrar giriş yapmalısınız.',
      )
    }

    const response =
      await fetch(
        `${this.baseUrl}/auth/refresh`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            refresh_token:
              refreshToken,
          }),
        },
      )

    let responseBody:
      RefreshTokenApiResponse | null =
      null

    try {
      responseBody =
        await response.json()
    } catch {
      responseBody =
        null
    }

    if (
      !response.ok ||
      responseBody === null ||
      !responseBody.status ||
      !responseBody.data
    ) {
      this.authenticationFailed(
        responseBody?.message ??
          'Oturum süresi doldu. Tekrar giriş yapmalısınız.',
      )
    }

    this.tokenStorage
      .saveAccessToken(
        responseBody.data
          .access_token,
      )

    this.tokenStorage
      .saveRefreshToken(
        responseBody.data
          .refresh_token,
      )
  }

  private authenticationFailed(
    message: string,
  ): never {
    this.tokenStorage
      .clearTokens()

    this.onAuthenticationFailed()

    throw new Error(
      message,
    )
  }
}