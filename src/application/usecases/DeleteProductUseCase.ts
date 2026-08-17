import type { ProductRepository } from '../../domain/repositories/ProductRepository'

export class DeleteProductUseCase {
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
  ): Promise<void> {
    if (publicId.trim() === '') {
      throw new Error(
        'Ürün ID boş olamaz',
      )
    }

    await this.productRepository.delete(
      publicId,
    )
  }
}