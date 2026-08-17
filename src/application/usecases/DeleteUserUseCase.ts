import type {
  AdminUser,
} from '../../domain/entities/AdminUser'

import type {
  UserRepository,
} from '../../domain/repositories/UserRepository'


export class DeleteUserUseCase {
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
    publicId: string,
  ): Promise<AdminUser> {
    if (
      publicId.trim() === ''
    ) {
      throw new Error(
        'Kullanıcı UUID boş olamaz',
      )
    }

    return await this.userRepository
      .delete(
        publicId,
      )
  }
}