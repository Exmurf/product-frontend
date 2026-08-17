import type { Profile } from '../../domain/entities/Profile'

import type { ProfileRepository } from '../../domain/repositories/ProfileRepository'

export class GetUserProfileUseCase {
  private profileRepository:
    ProfileRepository

  constructor(
    profileRepository:
      ProfileRepository,
  ) {
    this.profileRepository =
      profileRepository
  }

  async execute(
    userPublicId: string,
  ): Promise<Profile> {
    if (
      userPublicId.trim() === ''
    ) {
      throw new Error(
        'Kullanıcı UUID boş olamaz',
      )
    }

    return await this.profileRepository
      .getUserProfile(
        userPublicId,
      )
  }
}