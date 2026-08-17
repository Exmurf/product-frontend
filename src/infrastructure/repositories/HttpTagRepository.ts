import type {
  AuthenticatedHttpClient,
} from '../http/AuthenticatedHttpClient'

import type {
  Tag,
} from '../../domain/entities/Tag'

import type {
  TagRepository,
} from '../../domain/repositories/TagRepository'


interface TagApiItem {
  public_id: string
  name: string
}


interface TagListApiResponse {
  status: boolean

  data?: TagApiItem[]

  message?: string
}


interface TagApiResponse {
  status: boolean

  data?: TagApiItem

  message?: string
}


interface ErrorApiResponse {
  message?: string

  detail?: Array<{
    loc: Array<
      string | number
    >

    msg: string
  }>
}


export class HttpTagRepository
implements TagRepository {
  private httpClient:
    AuthenticatedHttpClient

  constructor(
    httpClient:
      AuthenticatedHttpClient,
  ) {
    this.httpClient =
      httpClient
  }

  async getAll():
    Promise<Tag[]> {
    const response =
      await this.httpClient
        .request(
          '/tags',
          {
            method: 'GET',
          },
        )

    if (!response.ok) {
      throw new Error(
        await this
          .getErrorMessage(
            response,
          ),
      )
    }

    const responseBody:
      TagListApiResponse =
      await response.json()

    if (
      !responseBody.status ||
      !responseBody.data
    ) {
      throw new Error(
        responseBody.message ??
          'Tagler alınamadı',
      )
    }

    return responseBody
      .data
      .map(
        (item) => {
          return this.mapTag(
            item,
          )
        },
      )
  }

  async create(
    name: string,
  ): Promise<Tag> {
    const response =
      await this.httpClient
        .request(
          '/tags',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                name: name,
              }),
          },
        )

    if (!response.ok) {
      throw new Error(
        await this
          .getErrorMessage(
            response,
          ),
      )
    }

    const responseBody:
      TagApiResponse =
      await response.json()

    if (
      !responseBody.status ||
      !responseBody.data
    ) {
      throw new Error(
        responseBody.message ??
          'Tag oluşturulamadı',
      )
    }

    return this.mapTag(
      responseBody.data,
    )
  }

  async delete(
    publicId: string,
  ): Promise<Tag> {
    const response =
      await this.httpClient.request(
        `/tags/${encodeURIComponent(publicId)}`,
        {
          method: 'DELETE',
        },
      )

    if (!response.ok) {
      throw new Error(
        await this.getErrorMessage(
          response,
        ),
      )
    }

    const responseBody:
      TagApiResponse =
      await response.json()

    if (
      !responseBody.status ||
      !responseBody.data
    ) {
      throw new Error(
        responseBody.message ??
          'Tag silinemedi',
      )
    }

    return this.mapTag(
      responseBody.data,
    )
  }

  private mapTag(
    item: TagApiItem,
  ): Tag {
    return {
      publicId:
        item.public_id,

      name:
        item.name,
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
