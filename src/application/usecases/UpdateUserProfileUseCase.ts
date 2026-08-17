import type { Profile } from '../../domain/entities/Profile'

import type {
  ProfileRepository,
  UpdateProfileData,
} from '../../domain/repositories/ProfileRepository'

export class UpdateUserProfileUseCase {
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
    data: UpdateProfileData,
  ): Promise<Profile> {
    if (
      userPublicId.trim() === ''
    ) {
      throw new Error(
        'Kullanıcı UUID boş olamaz',
      )
    }

    if (
      data.firstName !== null &&
      data.firstName.length > 100
    ) {
      throw new Error(
        'Ad en fazla 100 karakter olabilir',
      )
    }

    if (
      data.lastName !== null &&
      data.lastName.length > 100
    ) {
      throw new Error(
        'Soyad en fazla 100 karakter olabilir',
      )
    }

    if (
      data.bio !== null &&
      data.bio.length > 500
    ) {
      throw new Error(
        'Bio en fazla 500 karakter olabilir',
      )
    }

    return await this.profileRepository
      .updateUserProfile(
        userPublicId,
        data,
      )
  }
}