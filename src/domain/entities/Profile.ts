export interface ProfileUser {
  publicId: string
  email: string
}

export interface Profile {
  user: ProfileUser
  firstName: string | null
  lastName: string | null
  bio: string | null
}