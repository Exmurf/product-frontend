import type {
  CurrentUser,
} from '../entities/CurrentUser'

export interface CurrentUserRepository {
  getCurrentUser():
    Promise<CurrentUser>
}