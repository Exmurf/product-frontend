import type { Product } from '../entities/Product'

export type ProductSortBy =
  | 'id'
  | 'name'
  | 'price'
  | 'stock'

export type SortOrder =
  | 'asc'
  | 'desc'

export interface ProductQuery {
  page: number
  pageSize: number

  search?: string

  minPrice?: number
  maxPrice?: number
  minStock?: number

  sortBy: ProductSortBy
  sortOrder: SortOrder
}

export interface ProductPage {
  items: Product[]

  page: number
  pageSize: number

  totalItems: number
  totalPages: number
}

export interface ProductDetailInput {
  description: string | null
  brand: string | null
  warrantyMonths: number | null
}

export interface CreateProductData {
  name: string
  price: number
  stock: number

  tags: string[]

  detail:
    ProductDetailInput | null
}

export interface UpdateProductData {
  name?: string | null
  price?: number | null
  stock?: number | null

  tags?: string[] | null

  detail?:
    ProductDetailInput | null
}

export interface ProductRepository {
  getAll(
    query: ProductQuery,
  ): Promise<ProductPage>

  getByPublicId(
    publicId: string,
  ): Promise<Product>

  create(
    data: CreateProductData,
  ): Promise<Product>

  update(
    publicId: string,
    data: UpdateProductData,
  ): Promise<Product>

  delete(
    publicId: string,
  ): Promise<void>
}