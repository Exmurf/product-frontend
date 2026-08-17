import type {
  AuthenticatedHttpClient,
} from '../http/AuthenticatedHttpClient'

import type {
  AdminUser,
  AdminUserRole,
} from '../../domain/entities/AdminUser'

import type {
  UserPage,
  UserQuery,
  UserRepository,
} from '../../domain/repositories/UserRepository'


interface UserApiItem {
  public_id: string

  email: string

  role: AdminUserRole

  is_active: boolean

  is_deleted: boolean

  deleted_at: string | null

  created_at: string | null
}


interface ErrorItem {
  field?: string

  message?: string
}


interface UserListApiResponse {
  status: boolean

  data?: {
    items: UserApiItem[]

    page: number

    page_size: number

    total_items: number

    total_pages: number
  }

  message?: string

  errors?: ErrorItem[]
}


interface UserItemApiResponse {
  status: boolean

  data?: UserApiItem

  message?: string

  errors?: ErrorItem[]
}


export class HttpUserRepository
  implements UserRepository
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

  async getAll(
    query: UserQuery,
  ): Promise<UserPage> {
    const params =
      new URLSearchParams()

    params.set(
      'page',
      String(query.page),
    )

    params.set(
      'page_size',
      String(query.pageSize),
    )

    if (
      query.search !==
      undefined
    ) {
      const search =
        query.search.trim()

      if (
        search !== ''
      ) {
        params.set(
          'search',
          search,
        )
      }
    }

    if (
      query.role !==
      undefined
    ) {
      params.set(
        'role',
        query.role,
      )
    }

    if (
      query.isActive !==
      undefined
    ) {
      params.set(
        'is_active',
        String(
          query.isActive,
        ),
      )
    }

    if (
      query.isDeleted !==
      undefined
    ) {
      params.set(
        'is_deleted',
        String(query.isDeleted),
      )
    }

    const response =
      await this.httpClient.request(
        `/users?${params.toString()}`,
        {
          method: 'GET',
        },
      )

    let responseBody:
      UserListApiResponse | null =
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
      items:
        responseBody.data
          .items
          .map(
            (user) => {
              return this.mapUser(
                user,
              )
            },
          ),

      page:
        responseBody.data
          .page,

      pageSize:
        responseBody.data
          .page_size,

      totalItems:
        responseBody.data
          .total_items,

      totalPages:
        responseBody.data
          .total_pages,
    }
  }

  async delete(
    publicId: string,
  ): Promise<AdminUser> {
    const response =
      await this.httpClient.request(
        `/users/${encodeURIComponent(publicId)}`,
        {
          method: 'DELETE',
        },
      )

    let responseBody:
      UserItemApiResponse | null =
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

  async updateActive(
    publicId: string,
    isActive: boolean,
  ): Promise<AdminUser> {
    const response =
      await this.httpClient.request(
        `/users/${encodeURIComponent(publicId)}/active`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            is_active: isActive,
          }),
        },
      )

    let responseBody:
      UserItemApiResponse | null =
      null

    try {
      responseBody =
        await response.json()
    } catch {
      responseBody = null
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
    user: UserApiItem,
  ): AdminUser {
    return {
      publicId:
        user.public_id,

      email:
        user.email,

      role:
        user.role,

      isActive:
        user.is_active,

      isDeleted:
        user.is_deleted,

      deletedAt:
        user.deleted_at,

      createdAt:
        user.created_at,
    }
  }

  private getErrorMessage(
    status: number,

    responseBody:
      {
        message?: string

        errors?: ErrorItem[]
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
              return (
                error.message ??
                ''
              )
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
      `Kullanıcı işlemi başarısız. HTTP ${status}`
    )
  }
}
