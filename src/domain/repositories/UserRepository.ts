import type {
  AdminUser,
  AdminUserRole,
} from '../entities/AdminUser'


export interface UserQuery {
  page: number

  pageSize: number

  search?: string

  role?: AdminUserRole

  isActive?: boolean
}


export interface UserPage {
  items: AdminUser[]

  page: number

  pageSize: number

  totalItems: number

  totalPages: number
}


export interface UserRepository {
  getAll(
    query: UserQuery,
  ): Promise<UserPage>

  delete(
    publicId: string,
  ): Promise<AdminUser>
}