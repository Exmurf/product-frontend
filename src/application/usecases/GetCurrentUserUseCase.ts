import type {
  CurrentUser,
} from '../../domain/entities/CurrentUser'

import type {
  CurrentUserRepository,
} from '../../domain/repositories/CurrentUserRepository'

export class GetCurrentUserUseCase {
  private currentUserRepository:
    CurrentUserRepository

  constructor(
    currentUserRepository:
      CurrentUserRepository,
  ) {
    this.currentUserRepository =
      currentUserRepository
  }

  async execute():
    Promise<CurrentUser> {
    return await this.currentUserRepository
      .getCurrentUser()
  }
}