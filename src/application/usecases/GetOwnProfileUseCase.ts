import type { Profile } from '../../domain/entities/Profile'

import type { ProfileRepository } from '../../domain/repositories/ProfileRepository'

export class GetOwnProfileUseCase {
  private profileRepository:
    ProfileRepository

  constructor(
    profileRepository:
      ProfileRepository,
  ) {
    this.profileRepository =
      profileRepository
  }

  async execute():
    Promise<Profile> {
    return await this.profileRepository
      .getOwnProfile()
  }
}