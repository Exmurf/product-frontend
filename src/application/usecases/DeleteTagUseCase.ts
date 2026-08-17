import type {
  Tag,
} from '../../domain/entities/Tag'
import type {
  TagRepository,
} from '../../domain/repositories/TagRepository'


export class DeleteTagUseCase {
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
    publicId: string,
  ): Promise<Tag> {
    if (publicId.trim() === '') {
      throw new Error(
        'Tag kimliği boş olamaz',
      )
    }

    return await this
      .tagRepository
      .delete(publicId)
  }
}
