import type { Product } from '../../domain/entities/Product'

import type {
  CreateProductData,
  ProductRepository,
} from '../../domain/repositories/ProductRepository'

export class CreateProductUseCase {
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
    data: CreateProductData,
  ): Promise<Product> {
    if (data.name.trim() === '') {
      throw new Error(
        'Ürün adı boş olamaz',
      )
    }

    if (
      !Number.isFinite(
        data.price,
      ) ||
      data.price < 0
    ) {
      throw new Error(
        'Fiyat geçersiz',
      )
    }

    if (
      !Number.isInteger(
        data.stock,
      ) ||
      data.stock < 0
    ) {
      throw new Error(
        'Stok negatif olmayan tam sayı olmalıdır',
      )
    }

    if (
      data.detail !== null &&
      data.detail.warrantyMonths !== null &&
      (
        !Number.isInteger(
          data.detail.warrantyMonths,
        ) ||
        data.detail.warrantyMonths < 0
      )
    ) {
      throw new Error(
        'Garanti süresi negatif olmayan tam sayı olmalıdır',
      )
    }

    return await this.productRepository.create(
      {
        ...data,
        name: data.name.trim(),
      },
    )
  }
}