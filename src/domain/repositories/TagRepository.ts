import type {
  Tag,
} from '../entities/Tag'


export interface TagRepository {
  getAll(): Promise<Tag[]>

  create(
    name: string,
  ): Promise<Tag>

  delete(
    publicId: string,
  ): Promise<Tag>
}
