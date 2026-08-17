import type { Profile } from '../entities/Profile'

export interface UpdateProfileData {
  firstName: string | null
  lastName: string | null
  bio: string | null
}

export interface ProfileRepository {
  getOwnProfile():
    Promise<Profile>

  updateOwnProfile(
    data: UpdateProfileData,
  ): Promise<Profile>

  getUserProfile(
    userPublicId: string,
  ): Promise<Profile>

  updateUserProfile(
    userPublicId: string,
    data: UpdateProfileData,
  ): Promise<Profile>
}