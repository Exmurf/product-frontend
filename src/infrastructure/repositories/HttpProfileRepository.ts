import type { AuthenticatedHttpClient } from '../http/AuthenticatedHttpClient'

import type { Profile } from '../../domain/entities/Profile'

import type {
  ProfileRepository,
  UpdateProfileData,
} from '../../domain/repositories/ProfileRepository'

interface ProfileApiData {
  user: {
    public_id: string
    email: string
  }

  first_name:
    string | null

  last_name:
    string | null

  bio:
    string | null
}

interface ProfileApiResponse {
  status: boolean

  data?: ProfileApiData

  message?: string
}

interface ValidationErrorItem {
  loc: Array<string | number>
  msg: string
  type: string
}

interface ErrorApiResponse {
  message?: string

  detail?:
    ValidationErrorItem[]
}

export class HttpProfileRepository
  implements ProfileRepository
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

  async getOwnProfile():
    Promise<Profile> {
    const response =
      await this.httpClient.request(
        '/profiles/me',
        {
          method: 'GET',
        },
      )

    return await this.parseProfileResponse(
      response,
      'Profil alınamadı',
    )
  }

  async updateOwnProfile(
    data: UpdateProfileData,
  ): Promise<Profile> {
    const response =
      await this.httpClient.request(
        '/profiles/me',
        {
          method: 'PUT',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            first_name:
              data.firstName,

            last_name:
              data.lastName,

            bio:
              data.bio,
          }),
        },
      )

    return await this.parseProfileResponse(
      response,
      'Profil güncellenemedi',
    )
  }

  async getUserProfile(
    userPublicId: string,
  ): Promise<Profile> {
    const response =
      await this.httpClient.request(
        `/profiles/${encodeURIComponent(userPublicId)}`,
        {
          method: 'GET',
        },
      )

    return await this.parseProfileResponse(
      response,
      'Kullanıcı profili alınamadı',
    )
  }

  async updateUserProfile(
    userPublicId: string,
    data: UpdateProfileData,
  ): Promise<Profile> {
    const response =
      await this.httpClient.request(
        `/profiles/${encodeURIComponent(userPublicId)}`,
        {
          method: 'PUT',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            first_name:
              data.firstName,

            last_name:
              data.lastName,

            bio:
              data.bio,
          }),
        },
      )

    return await this.parseProfileResponse(
      response,
      'Kullanıcı profili güncellenemedi',
    )
  }

  private async parseProfileResponse(
    response: Response,
    defaultErrorMessage: string,
  ): Promise<Profile> {
    if (!response.ok) {
      throw new Error(
        await this.getErrorMessage(
          response,
        ),
      )
    }

    const responseBody:
      ProfileApiResponse =
      await response.json()

    if (
      !responseBody.status ||
      !responseBody.data
    ) {
      throw new Error(
        responseBody.message ??
          defaultErrorMessage,
      )
    }

    return this.mapProfile(
      responseBody.data,
    )
  }

  private mapProfile(
    data: ProfileApiData,
  ): Profile {
    return {
      user: {
        publicId:
          data.user.public_id,

        email:
          data.user.email,
      },

      firstName:
        data.first_name,

      lastName:
        data.last_name,

      bio:
        data.bio,
    }
  }

  private async getErrorMessage(
    response: Response,
  ): Promise<string> {
    try {
      const body:
        ErrorApiResponse =
        await response.json()

      if (
        typeof body.message ===
        'string'
      ) {
        return body.message
      }

      if (
        Array.isArray(
          body.detail,
        )
      ) {
        const messages =
          body.detail.map(
            (error) => {
              return (
                `${error.loc.join('.')}: ` +
                error.msg
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
    } catch {
      // JSON olmayan hata cevabı.
    }

    return (
      `İstek başarısız. ` +
      `HTTP ${response.status}`
    )
  }
}