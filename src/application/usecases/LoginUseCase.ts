import type {
  AuthRepository,
} from '../../domain/repositories/AuthRepository'

import type {
  TokenStorage,
} from '../ports/TokenStorage'

import type {
  UserSessionStorage,
} from '../ports/UserSessionStorage'


export class LoginUseCase {
  private authRepository:
    AuthRepository

  private tokenStorage:
    TokenStorage

  private userSessionStorage:
    UserSessionStorage

  constructor(
    authRepository:
      AuthRepository,

    tokenStorage:
      TokenStorage,

    userSessionStorage:
      UserSessionStorage,
  ) {
    this.authRepository =
      authRepository

    this.tokenStorage =
      tokenStorage

    this.userSessionStorage =
      userSessionStorage
  }

  async execute(
    email: string,
    password: string,
  ): Promise<void> {
    const normalizedEmail =
      email.trim().toLowerCase()

    if (
      normalizedEmail === ''
    ) {
      throw new Error(
        'Email boş olamaz',
      )
    }

    if (
      password === ''
    ) {
      throw new Error(
        'Şifre boş olamaz',
      )
    }

    const result =
      await this.authRepository
        .login(
          normalizedEmail,
          password,
        )

    this.tokenStorage
      .saveAccessToken(
        result.accessToken,
      )

    this.tokenStorage
      .saveRefreshToken(
        result.refreshToken,
      )

    this.userSessionStorage
      .saveUserEmail(
        result.user.email,
      )
  }
}