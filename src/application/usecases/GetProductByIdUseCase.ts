import type { Product } from '../../domain/entities/Product'
import type { ProductRepository } from '../../domain/repositories/ProductRepository'

export class GetProductByIdUseCase {
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
  ): Promise<Product> {
    if (publicId.trim() === '') {
      throw new Error(
        'Ürün ID boş olamaz',
      )
    }

    return await this.productRepository.getByPublicId(
      publicId,
    )
  }
}