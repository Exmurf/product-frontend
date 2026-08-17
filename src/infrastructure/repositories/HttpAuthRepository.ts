import type {
  AuthRepository,
  AuthUser,
  LoginResult,
} from '../../domain/repositories/AuthRepository'

import type {
  UserRole,
} from '../../domain/entities/CurrentUser'


interface ApiUser {
  public_id: string
  email: string
  role: UserRole
  is_active: boolean
}


interface LoginApiResponse {
  status: boolean

  data?: {
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
    user: ApiUser
  }

  message?: string

  errors?: Array<{
    field?: string
    message?: string
  }>
}


interface RegisterApiResponse {
  status: boolean

  data?: ApiUser

  message?: string

  errors?: Array<{
    field?: string
    message?: string
  }>
}


export class HttpAuthRepository
  implements AuthRepository
{
  private baseUrl: string

  constructor(
    baseUrl: string,
  ) {
    this.baseUrl =
      baseUrl
  }

  async login(
    email: string,
    password: string,
  ): Promise<LoginResult> {
    const response =
      await fetch(
        `${this.baseUrl}/auth/login`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            email: email,
            password: password,
          }),
        },
      )

    let responseBody:
      LoginApiResponse | null =
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
      throw new Error(
        this.getErrorMessage(
          response.status,
          responseBody,
        ),
      )
    }

    return {
      accessToken:
        responseBody.data
          .access_token,

      refreshToken:
        responseBody.data
          .refresh_token,

      tokenType:
        responseBody.data
          .token_type,

      expiresIn:
        responseBody.data
          .expires_in,

      user:
        this.mapUser(
          responseBody.data
            .user,
        ),
    }
  }

  async register(
    email: string,
    password: string,
  ): Promise<AuthUser> {
    const response =
      await fetch(
        `${this.baseUrl}/auth/register`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            email: email,
            password: password,
          }),
        },
      )

    let responseBody:
      RegisterApiResponse | null =
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
      throw new Error(
        this.getErrorMessage(
          response.status,
          responseBody,
        ),
      )
    }

    return this.mapUser(
      responseBody.data,
    )
  }

  private mapUser(
    user: ApiUser,
  ): AuthUser {
    return {
      publicId:
        user.public_id,

      email:
        user.email,

      role:
        user.role,

      isActive:
        user.is_active,
    }
  }

  private getErrorMessage(
    status: number,

    responseBody:
      {
        message?: string

        errors?: Array<{
          field?: string
          message?: string
        }>
      } | null,
  ): string {
    if (
      responseBody !== null &&
      typeof responseBody
        .message ===
        'string'
    ) {
      return responseBody
        .message
    }

    if (
      responseBody !== null &&
      Array.isArray(
        responseBody.errors,
      )
    ) {
      const messages =
        responseBody.errors
          .map(
            (error) => {
              if (
                typeof error
                  .message ===
                'string'
              ) {
                return error.message
              }

              return ''
            },
          )
          .filter(
            (message) => {
              return (
                message !== ''
              )
            },
          )

      if (
        messages.length > 0
      ) {
        return messages.join(
          ' | ',
        )
      }
    }

    return (
      `İstek başarısız. HTTP ${status}`
    )
  }
}