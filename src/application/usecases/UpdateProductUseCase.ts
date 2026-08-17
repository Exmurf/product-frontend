import type { Product } from '../../domain/entities/Product'

import type {
  ProductRepository,
  UpdateProductData,
} from '../../domain/repositories/ProductRepository'

export class UpdateProductUseCase {
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
    publicId: string,
    data: UpdateProductData,
  ): Promise<Product> {
    if (
      data.name !== undefined &&
      data.name !== null &&
      data.name.trim() === ''
    ) {
      throw new Error(
        'Ürün adı boş olamaz',
      )
    }

    if (
      data.price !== undefined &&
      data.price !== null &&
      (
        !Number.isFinite(
          data.price,
        ) ||
        data.price < 0
      )
    ) {
      throw new Error(
        'Fiyat geçersiz',
      )
    }

    if (
      data.stock !== undefined &&
      data.stock !== null &&
      (
        !Number.isInteger(
          data.stock,
        ) ||
        data.stock < 0
      )
    ) {
      throw new Error(
        'Stok negatif olmayan tam sayı olmalıdır',
      )
    }

    return await this.productRepository.update(
      publicId,
      data,
    )
  }
}