export type AdminUserRole =
  'user' | 'admin'

export interface AdminUser {
  publicId: string
  email: string
  role: AdminUserRole
  isActive: boolean
  createdAt: string | null
}