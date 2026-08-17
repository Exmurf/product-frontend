import type {
  Tag,
} from '../../domain/entities/Tag'

import type {
  TagRepository,
} from '../../domain/repositories/TagRepository'


export class CreateTagUseCase {
  private tagRepository:
    TagRepository

  constructor(
    tagRepository:
      TagRepository,
  ) {
    this.tagRepository =
      tagRepository
  }

  async execute(
    name: string,
  ): Promise<Tag> {
    const normalizedName =
      name.trim()

    if (
      normalizedName === ''
    ) {
      throw new Error(
        'Tag adı boş olamaz',
      )
    }

    if (
      normalizedName.length >
      50
    ) {
      throw new Error(
        'Tag adı en fazla 50 karakter olabilir',
      )
    }

    return await this
      .tagRepository
      .create(
        normalizedName,
      )
  }
}
