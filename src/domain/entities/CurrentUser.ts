export type UserRole =
  'user' | 'admin'

export interface CurrentUser {
  publicId: string
  email: string
  role: UserRole
  isActive: boolean
}