import type {
  ProductPage,
  ProductQuery,
  ProductRepository,
} from '../../domain/repositories/ProductRepository'

export class GetProductsUseCase {
  private productRepository:
    ProductRepository

  constructor(
    productRepository:
      ProductRepository,
  ) {
    this.productRepository =
      productRepository
  }

  async execute(
    query: ProductQuery,
  ): Promise<ProductPage> {
    if (query.page < 1) {
      throw new Error(
        'Sayfa numarası geçersiz',
      )
    }

    if (
      query.pageSize < 1 ||
      query.pageSize > 100
    ) {
      throw new Error(
        'Sayfa boyutu 1-100 arasında olmalıdır',
      )
    }

    if (
      query.minPrice !== undefined &&
      query.maxPrice !== undefined &&
      query.minPrice >
        query.maxPrice
    ) {
      throw new Error(
        'Minimum fiyat maksimum fiyattan büyük olamaz',
      )
    }

    return await this.productRepository
      .getAll(
        query,
      )
  }
}