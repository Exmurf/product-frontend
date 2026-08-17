import type {
  AuthenticatedHttpClient,
} from '../http/AuthenticatedHttpClient'

import type {
  CurrentUser,
  UserRole,
} from '../../domain/entities/CurrentUser'

import type {
  CurrentUserRepository,
} from '../../domain/repositories/CurrentUserRepository'


interface CurrentUserApiResponse {
  status: boolean

  data?: {
    public_id: string
    email: string
    role: UserRole
    is_active: boolean
  }

  message?: string

  errors?: Array<{
    field?: string
    message?: string
  }>
}


export class HttpCurrentUserRepository
  implements CurrentUserRepository
{
  private httpClient:
    AuthenticatedHttpClient

  constructor(
    httpClient:
      AuthenticatedHttpClient,
  ) {
    this.httpClient =
      httpClient
  }

  async getCurrentUser():
    Promise<CurrentUser> {
    const response =
      await this.httpClient.request(
        '/auth/me',
        {
          method: 'GET',
        },
      )

    const responseBody:
      CurrentUserApiResponse =
      await response.json()

    if (
      !response.ok ||
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
      publicId:
        responseBody.data
          .public_id,

      email:
        responseBody.data
          .email,

      role:
        responseBody.data
          .role,

      isActive:
        responseBody.data
          .is_active,
    }
  }

  private getErrorMessage(
    status: number,
    responseBody:
      CurrentUserApiResponse,
  ): string {
    if (
      typeof responseBody
        .message ===
      'string'
    ) {
      return responseBody
        .message
    }

    return (
      `Kullanıcı bilgisi alınamadı. ` +
      `HTTP ${status}`
    )
  }
}