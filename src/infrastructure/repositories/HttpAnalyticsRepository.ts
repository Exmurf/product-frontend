import type {
  AuthenticatedHttpClient,
} from '../http/AuthenticatedHttpClient'

import type {
  UserAnalytics,
} from '../../domain/entities/Analytics'

import type {
  AnalyticsQuery,
  AnalyticsRepository,
} from '../../domain/repositories/AnalyticsRepository'


interface AnalyticsApiResponse {
  status: boolean

  data?: {
    user_public_id: string

    email: string

    registered_at: string

    first_product_created_at:
      string | null

    total_products: number

    total_tags: number

    average_products_per_day:
      number

    start_date: string

    end_date: string
  }

  message?: string

  errors?: Array<{
    field?: string
    message?: string
  }>
}


export class HttpAnalyticsRepository
  implements AnalyticsRepository
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

  async getMine(
    query: AnalyticsQuery,
  ): Promise<UserAnalytics> {
    return await this.requestAnalytics(
      '/analytics/me',
      query,
    )
  }

  async getUser(
    userPublicId: string,
    query: AnalyticsQuery,
  ): Promise<UserAnalytics> {
    return await this.requestAnalytics(
      `/analytics/users/${encodeURIComponent(userPublicId)}`,
      query,
    )
  }

  private async requestAnalytics(
    path: string,
    query: AnalyticsQuery,
  ): Promise<UserAnalytics> {
    const params =
      this.buildParams(
        query,
      )

    const queryString =
      params.toString()

    const requestPath =
      queryString === ''
        ? path
        : `${path}?${queryString}`

    const response =
      await this.httpClient.request(
        requestPath,
        {
          method: 'GET',
        },
      )

    let responseBody:
      AnalyticsApiResponse | null =
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

    const data =
      responseBody.data

    return {
      userPublicId:
        data.user_public_id,

      email:
        data.email,

      registeredAt:
        data.registered_at,

      firstProductCreatedAt:
        data.first_product_created_at,

      totalProducts:
        data.total_products,

      totalTags:
        data.total_tags,

      averageProductsPerDay:
        data.average_products_per_day,

      startDate:
        data.start_date,

      endDate:
        data.end_date,
    }
  }

  private buildParams(
    query: AnalyticsQuery,
  ): URLSearchParams {
    const params =
      new URLSearchParams()

    if (
      query.startDate !==
        undefined &&
      query.startDate !== ''
    ) {
      params.set(
        'start_date',
        query.startDate,
      )
    }

    if (
      query.startTime !==
        undefined &&
      query.startTime !== ''
    ) {
      params.set(
        'start_time',
        query.startTime,
      )
    }

    if (
      query.endDate !==
        undefined &&
      query.endDate !== ''
    ) {
      params.set(
        'end_date',
        query.endDate,
      )
    }

    if (
      query.endTime !==
        undefined &&
      query.endTime !== ''
    ) {
      params.set(
        'end_time',
        query.endTime,
      )
    }

    return params
  }

  private getErrorMessage(
    status: number,

    responseBody:
      AnalyticsApiResponse | null,
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

    if (
      status === 403
    ) {
      return (
        'Bu kullanıcının analytics ' +
        'verilerini görme yetkiniz yok'
      )
    }

    return (
      `Analytics verileri alınamadı. HTTP ${status}`
    )
  }
}