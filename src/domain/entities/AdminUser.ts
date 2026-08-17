export type AdminUserRole =
  'user' | 'admin'

export interface AdminUser {
  publicId: string
  email: string
  role: AdminUserRole
  isActive: boolean
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string | null
}
