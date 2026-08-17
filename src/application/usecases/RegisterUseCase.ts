import type {
  AuthRepository,
  AuthUser,
} from '../../domain/repositories/AuthRepository'


export class RegisterUseCase {
  private authRepository:
    AuthRepository

  constructor(
    authRepository:
      AuthRepository,
  ) {
    this.authRepository =
      authRepository
  }

  async execute(
    email: string,
    password: string,
  ): Promise<AuthUser> {
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
      password.length < 8
    ) {
      throw new Error(
        'Şifre en az 8 karakter olmalıdır',
      )
    }

    if (
      password.length > 128
    ) {
      throw new Error(
        'Şifre en fazla 128 karakter olabilir',
      )
    }

    return await this.authRepository
      .register(
        normalizedEmail,
        password,
      )
  }
}