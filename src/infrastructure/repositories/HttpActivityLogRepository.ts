import type {
  AuthenticatedHttpClient,
} from '../http/AuthenticatedHttpClient'

import type {
  ActivityAction,
  ActivityEntityType,
  ActivityLog,
} from '../../domain/entities/ActivityLog'

import type {
  ActivityLogPage,
  ActivityLogQuery,
  ActivityLogRepository,
} from '../../domain/repositories/ActivityLogRepository'


interface ActivityLogApiItem {
  id: number | null

  user_public_id:
    string | null

  action:
    ActivityAction

  entity_type:
    ActivityEntityType

  entity_id:
    string | null

  old_value:
    unknown

  new_value:
    unknown

  created_at:
    string | null
}


interface ActivityLogApiResponse {
  status: boolean

  data?: {
    items:
      ActivityLogApiItem[]

    page: number

    page_size: number

    total_items: number
  }

  message?: string

  errors?: Array<{
    field?: string
    message?: string
  }>
}


export class HttpActivityLogRepository
  implements ActivityLogRepository
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
    query: ActivityLogQuery,
  ): Promise<ActivityLogPage> {
    const params =
      this.buildParams(
        query,
        false,
      )

    return await this.requestLogs(
      `/activity-logs/me?${params.toString()}`,
    )
  }

  async getAll(
    query: ActivityLogQuery,
  ): Promise<ActivityLogPage> {
    const params =
      this.buildParams(
        query,
        true,
      )

    return await this.requestLogs(
      `/activity-logs?${params.toString()}`,
    )
  }

  private buildParams(
    query: ActivityLogQuery,
    includeUserPublicId: boolean,
  ): URLSearchParams {
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
      includeUserPublicId &&
      query.userPublicId !==
        undefined
    ) {
      const userPublicId =
        query.userPublicId.trim()

      if (
        userPublicId !== ''
      ) {
        params.set(
          'user_public_id',
          userPublicId,
        )
      }
    }

    if (
      query.action !==
      undefined
    ) {
      params.set(
        'action',
        query.action,
      )
    }

    if (
      query.entityType !==
      undefined
    ) {
      params.set(
        'entity_type',
        query.entityType,
      )
    }

    if (
      query.entityId !==
      undefined
    ) {
      const entityId =
        query.entityId.trim()

      if (
        entityId !== ''
      ) {
        params.set(
          'entity_id',
          entityId,
        )
      }
    }

    return params
  }

  private async requestLogs(
    path: string,
  ): Promise<ActivityLogPage> {
    const response =
      await this.httpClient.request(
        path,
        {
          method: 'GET',
        },
      )

    let responseBody:
      ActivityLogApiResponse | null =
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

    const totalPages =
      data.total_items === 0
        ? 0
        : Math.ceil(
            data.total_items /
              data.page_size,
          )

    return {
      items:
        data.items.map(
          (item) => {
            return this.mapLog(
              item,
            )
          },
        ),

      page:
        data.page,

      pageSize:
        data.page_size,

      totalItems:
        data.total_items,

      totalPages:
        totalPages,
    }
  }

  private mapLog(
    item: ActivityLogApiItem,
  ): ActivityLog {
    return {
      id:
        item.id,

      userPublicId:
        item.user_public_id,

      action:
        item.action,

      entityType:
        item.entity_type,

      entityId:
        item.entity_id,

      oldValue:
        item.old_value,

      newValue:
        item.new_value,

      createdAt:
        item.created_at,
    }
  }

  private getErrorMessage(
    status: number,
    responseBody:
      ActivityLogApiResponse | null,
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
      status === 403
    ) {
      return (
        'Bu activity loglarını ' +
        'görmek için yetkiniz yok'
      )
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
      `Activity logları alınamadı. ` +
      `HTTP ${status}`
    )
  }
}