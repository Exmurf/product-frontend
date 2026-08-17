import type { AuthenticatedHttpClient } from '../http/AuthenticatedHttpClient'

import type { Product } from '../../domain/entities/Product'

import type {
  CreateProductData,
  ProductPage,
  ProductQuery,
  ProductRepository,
  UpdateProductData,
} from '../../domain/repositories/ProductRepository'

interface ProductDetailApi {
  description?: string | null
  brand?: string | null
  warranty_months?: number | null
}

interface ProductOwnerApi {
  public_id: string
  first_name?: string | null
  last_name?: string | null
  email: string
}

interface ProductApiItem {
  public_id: string
  name: string
  price: number
  stock: number

  owner?:
    ProductOwnerApi | null

  created_at?:
    string | null

  tags?: string[]

  detail?:
    ProductDetailApi | null
}

interface ProductsApiResponse {
  status: boolean

  data?: {
    items: ProductApiItem[]

    page: number
    page_size: number

    total_items: number
    total_pages: number
  }

  message?: string
}

interface ProductApiResponse {
  status: boolean

  data?: ProductApiItem

  message?: string
}

interface ProductDetailApiResponse {
  status: boolean
  data?: ProductDetailApi
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

export class HttpProductRepository
  implements ProductRepository
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
    query: ProductQuery,
  ): Promise<ProductPage> {
    const params =
      new URLSearchParams()

    params.set(
      'page',
      query.page.toString(),
    )

    params.set(
      'page_size',
      query.pageSize.toString(),
    )

    params.set(
      'sort_by',
      query.sortBy,
    )

    params.set(
      'sort_order',
      query.sortOrder,
    )

    if (
      query.search !== undefined &&
      query.search.trim() !== ''
    ) {
      params.set(
        'search',
        query.search.trim(),
      )
    }

    if (
      query.minPrice !== undefined
    ) {
      params.set(
        'min_price',
        query.minPrice.toString(),
      )
    }

    if (
      query.maxPrice !== undefined
    ) {
      params.set(
        'max_price',
        query.maxPrice.toString(),
      )
    }

    if (
      query.minStock !== undefined
    ) {
      params.set(
        'min_stock',
        query.minStock.toString(),
      )
    }

    const response =
      await this.httpClient.request(
        `/products?${params.toString()}`,
        {
          method: 'GET',
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
      ProductsApiResponse =
      await response.json()

    if (
      !responseBody.status ||
      !responseBody.data
    ) {
      throw new Error(
        responseBody.message ??
          'Ürünler alınamadı',
      )
    }

    const products =
      responseBody.data.items.map(
        (item) => {
          return this.mapProduct(
            item,
          )
        },
      )

    return {
      items:
        products,

      page:
        responseBody.data.page,

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

  async getByPublicId(
    publicId: string,
  ): Promise<Product> {
    const response =
      await this.httpClient.request(
        `/products/${encodeURIComponent(publicId)}`,
        {
          method: 'GET',
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
      ProductApiResponse =
      await response.json()

    if (
      !responseBody.status ||
      !responseBody.data
    ) {
      throw new Error(
        responseBody.message ??
          'Ürün alınamadı',
      )
    }

    return this.mapProduct(
      responseBody.data,
    )
  }

  async create(
    data: CreateProductData,
  ): Promise<Product> {
    const response =
      await this.httpClient.request(
        '/products',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            name:
              data.name,

            price:
              data.price,

            stock:
              data.stock,

            tags:
              data.tags,

            detail:
              data.detail === null
                ? null
                : {
                    description:
                      data.detail
                        .description,

                    brand:
                      data.detail
                        .brand,

                    warranty_months:
                      data.detail
                        .warrantyMonths,
                  },
          }),
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
      ProductApiResponse =
      await response.json()

    if (
      !responseBody.status ||
      !responseBody.data
    ) {
      throw new Error(
        responseBody.message ??
          'Ürün oluşturulamadı',
      )
    }

    return this.mapProduct(
      responseBody.data,
    )
  }

  async update(
    publicId: string,
    data: UpdateProductData,
  ): Promise<Product> {
    const requestBody:
      Record<string, unknown> =
      {}

    if (
      data.name !== undefined
    ) {
      requestBody.name =
        data.name
    }

    if (
      data.price !== undefined
    ) {
      requestBody.price =
        data.price
    }

    if (
      data.stock !== undefined
    ) {
      requestBody.stock =
        data.stock
    }

    if (
      data.tags !== undefined
    ) {
      requestBody.tags =
        data.tags
    }

    const currentProduct =
      data.detail !== undefined &&
      data.detail !== null
        ? await this.getByPublicId(
            publicId,
          )
        : null

    let updatedProduct:
      Product | null = null

    if (
      Object.keys(
        requestBody,
      ).length > 0
    ) {
      const response =
        await this.httpClient.request(
          `/products/${encodeURIComponent(publicId)}`,
          {
            method: 'PATCH',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify(
              requestBody,
            ),
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
        ProductApiResponse =
        await response.json()

      if (
        !responseBody.status ||
        !responseBody.data
      ) {
        throw new Error(
          responseBody.message ??
            'Ürün güncellenemedi',
        )
      }

      updatedProduct =
        this.mapProduct(
          responseBody.data,
        )
    }

    if (
      data.detail !== undefined &&
      data.detail !== null
    ) {
      const detailResponse =
        await this.httpClient.request(
          `/products/${encodeURIComponent(publicId)}/detail`,
          {
            method:
              currentProduct
                ?.detail === null
                ? 'POST'
                : 'PUT',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              description:
                data.detail
                  .description,

              brand:
                data.detail.brand,

              warranty_months:
                data.detail
                  .warrantyMonths,
            }),
          },
        )

      if (!detailResponse.ok) {
        throw new Error(
          await this.getErrorMessage(
            detailResponse,
          ),
        )
      }

      const detailResponseBody:
        ProductDetailApiResponse =
        await detailResponse.json()

      if (
        !detailResponseBody.status ||
        !detailResponseBody.data
      ) {
        throw new Error(
          detailResponseBody.message ??
            'Ürün detayı güncellenemedi',
        )
      }

      return await this.getByPublicId(
        publicId,
      )
    }

    return (
      updatedProduct ??
      await this.getByPublicId(
        publicId,
      )
    )
  }

  async delete(
    publicId: string,
  ): Promise<void> {
    const response =
      await this.httpClient.request(
        `/products/${encodeURIComponent(publicId)}`,
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
  }

  private mapProduct(
    item: ProductApiItem,
  ): Product {
    return {
      publicId:
        item.public_id,

      name:
        item.name,

      price:
        item.price,

      stock:
        item.stock,

      createdAt:
        item.created_at ??
        null,

      tags:
        item.tags ??
        [],

      owner:
        item.owner
          ? {
              publicId:
                item.owner
                  .public_id,

              firstName:
                item.owner
                  .first_name ??
                null,

              lastName:
                item.owner
                  .last_name ??
                null,

              email:
                item.owner.email,
            }
          : null,

      detail:
        item.detail
          ? {
              description:
                item.detail
                  .description ??
                null,

              brand:
                item.detail
                  .brand ??
                null,

              warrantyMonths:
                item.detail
                  .warranty_months ??
                null,
            }
          : null,
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
