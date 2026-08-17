import type {
  UserPage,
  UserQuery,
  UserRepository,
} from '../../domain/repositories/UserRepository'

export class GetUsersUseCase {
  private userRepository:
    UserRepository

  constructor(
    userRepository:
      UserRepository,
  ) {
    this.userRepository =
      userRepository
  }

  async execute(
    query: UserQuery,
  ): Promise<UserPage> {
    if (
      !Number.isInteger(
        query.page,
      ) ||
      query.page < 1
    ) {
      throw new Error(
        'Sayfa numarası en az 1 olmalıdır',
      )
    }

    if (
      !Number.isInteger(
        query.pageSize,
      ) ||
      query.pageSize < 1 ||
      query.pageSize > 100
    ) {
      throw new Error(
        'Sayfa boyutu 1 ile 100 arasında olmalıdır',
      )
    }

    if (
      query.search !==
        undefined &&
      query.search.length > 255
    ) {
      throw new Error(
        'Arama metni en fazla 255 karakter olabilir',
      )
    }

    return await this.userRepository
      .getAll(
        query,
      )
  }
}