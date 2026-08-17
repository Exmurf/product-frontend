import type {
  UserRole,
} from '../entities/CurrentUser'


export interface AuthUser {
  publicId: string

  email: string

  role: UserRole

  isActive: boolean
}


export interface LoginResult {
  accessToken: string

  refreshToken: string

  tokenType: string

  expiresIn: number

  user: AuthUser
}


export interface AuthRepository {
  login(
    email: string,
    password: string,
  ): Promise<LoginResult>

  register(
    email: string,
    password: string,
  ): Promise<AuthUser>
}