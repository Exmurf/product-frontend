import type {
  Tag,
} from '../../domain/entities/Tag'

import type {
  TagRepository,
} from '../../domain/repositories/TagRepository'


export class GetTagsUseCase {
  private tagRepository:
    TagRepository

  constructor(
    tagRepository:
      TagRepository,
  ) {
    this.tagRepository =
      tagRepository
  }

  async execute():
    Promise<Tag[]> {
    return await this
      .tagRepository
      .getAll()
  }
}
