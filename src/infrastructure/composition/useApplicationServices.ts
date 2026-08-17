import {
  useMemo,
} from 'react'

import {
  CreateProductUseCase,
} from '../../application/usecases/CreateProductUseCase'
import {
  CreateTagUseCase,
} from '../../application/usecases/CreateTagUseCase'
import {
  DeleteProductUseCase,
} from '../../application/usecases/DeleteProductUseCase'
import {
  DeleteTagUseCase,
} from '../../application/usecases/DeleteTagUseCase'
import {
  DeleteUserUseCase,
} from '../../application/usecases/DeleteUserUseCase'
import {
  GetActivityLogsUseCase,
} from '../../application/usecases/GetActivityLogsUseCase'
import {
  GetCurrentUserUseCase,
} from '../../application/usecases/GetCurrentUserUseCase'
import {
  GetOwnAnalyticsUseCase,
} from '../../application/usecases/GetOwnAnalyticsUseCase'
import {
  GetOwnProfileUseCase,
} from '../../application/usecases/GetOwnProfileUseCase'
import {
  GetProductByIdUseCase,
} from '../../application/usecases/GetProductByIdUseCase'
import {
  GetProductsUseCase,
} from '../../application/usecases/GetProductsUseCase'
import {
  GetTagsUseCase,
} from '../../application/usecases/GetTagsUseCase'
import {
  GetUserAnalyticsUseCase,
} from '../../application/usecases/GetUserAnalyticsUseCase'
import {
  GetUserProfileUseCase,
} from '../../application/usecases/GetUserProfileUseCase'
import {
  GetUsersUseCase,
} from '../../application/usecases/GetUsersUseCase'
import {
  LoginUseCase,
} from '../../application/usecases/LoginUseCase'
import {
  LogoutUseCase,
} from '../../application/usecases/LogoutUseCase'
import {
  RegisterUseCase,
} from '../../application/usecases/RegisterUseCase'
import {
  UpdateOwnProfileUseCase,
} from '../../application/usecases/UpdateOwnProfileUseCase'
import {
  UpdateProductUseCase,
} from '../../application/usecases/UpdateProductUseCase'
import {
  UpdateUserProfileUseCase,
} from '../../application/usecases/UpdateUserProfileUseCase'
import {
  AuthenticatedHttpClient,
} from '../http/AuthenticatedHttpClient'
import {
  HttpActivityLogRepository,
} from '../repositories/HttpActivityLogRepository'
import {
  HttpAnalyticsRepository,
} from '../repositories/HttpAnalyticsRepository'
import {
  HttpAuthRepository,
} from '../repositories/HttpAuthRepository'
import {
  HttpCurrentUserRepository,
} from '../repositories/HttpCurrentUserRepository'
import {
  HttpProductRepository,
} from '../repositories/HttpProductRepository'
import {
  HttpProfileRepository,
} from '../repositories/HttpProfileRepository'
import {
  HttpTagRepository,
} from '../repositories/HttpTagRepository'
import {
  HttpUserRepository,
} from '../repositories/HttpUserRepository'
import {
  LocalStorageTokenStorage,
} from '../storage/LocalStorageTokenStorage'
import {
  SessionStorageUserSessionStorage,
} from '../storage/SessionStorageUserSessionStorage'


const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL


export const tokenStorage =
  new LocalStorageTokenStorage()


export const userSessionStorage =
  new SessionStorageUserSessionStorage()


const authRepository =
  new HttpAuthRepository(
    apiBaseUrl,
  )


const publicServices = {
  loginUseCase:
    new LoginUseCase(
      authRepository,
      tokenStorage,
      userSessionStorage,
    ),

  registerUseCase:
    new RegisterUseCase(
      authRepository,
    ),

  logoutUseCase:
    new LogoutUseCase(
      tokenStorage,
      userSessionStorage,
    ),
}


export interface ApplicationServices {
  loginUseCase: LoginUseCase
  registerUseCase: RegisterUseCase
  logoutUseCase: LogoutUseCase
  getProductsUseCase: GetProductsUseCase
  getProductByIdUseCase: GetProductByIdUseCase
  createProductUseCase: CreateProductUseCase
  updateProductUseCase: UpdateProductUseCase
  deleteProductUseCase: DeleteProductUseCase
  getTagsUseCase: GetTagsUseCase
  createTagUseCase: CreateTagUseCase
  deleteTagUseCase: DeleteTagUseCase
  getOwnProfileUseCase: GetOwnProfileUseCase
  updateOwnProfileUseCase: UpdateOwnProfileUseCase
  getUserProfileUseCase: GetUserProfileUseCase
  updateUserProfileUseCase: UpdateUserProfileUseCase
  getUsersUseCase: GetUsersUseCase
  deleteUserUseCase: DeleteUserUseCase
  getCurrentUserUseCase: GetCurrentUserUseCase
  getActivityLogsUseCase: GetActivityLogsUseCase
  getOwnAnalyticsUseCase: GetOwnAnalyticsUseCase
  getUserAnalyticsUseCase: GetUserAnalyticsUseCase
}


export function useApplicationServices(
  onAuthenticationFailed: () => void,
): ApplicationServices {
  return useMemo(
    () => {
      const httpClient =
        new AuthenticatedHttpClient(
          apiBaseUrl,
          tokenStorage,
          onAuthenticationFailed,
        )

      const productRepository =
        new HttpProductRepository(
          httpClient,
        )

      const tagRepository =
        new HttpTagRepository(
          httpClient,
        )

      const profileRepository =
        new HttpProfileRepository(
          httpClient,
        )

      const userRepository =
        new HttpUserRepository(
          httpClient,
        )

      const analyticsRepository =
        new HttpAnalyticsRepository(
          httpClient,
        )

      return {
        ...publicServices,

        getProductsUseCase:
          new GetProductsUseCase(
            productRepository,
          ),

        getProductByIdUseCase:
          new GetProductByIdUseCase(
            productRepository,
          ),

        createProductUseCase:
          new CreateProductUseCase(
            productRepository,
          ),

        updateProductUseCase:
          new UpdateProductUseCase(
            productRepository,
          ),

        deleteProductUseCase:
          new DeleteProductUseCase(
            productRepository,
          ),

        getTagsUseCase:
          new GetTagsUseCase(
            tagRepository,
          ),

        createTagUseCase:
          new CreateTagUseCase(
            tagRepository,
          ),

        deleteTagUseCase:
          new DeleteTagUseCase(
            tagRepository,
          ),

        getOwnProfileUseCase:
          new GetOwnProfileUseCase(
            profileRepository,
          ),

        updateOwnProfileUseCase:
          new UpdateOwnProfileUseCase(
            profileRepository,
          ),

        getUserProfileUseCase:
          new GetUserProfileUseCase(
            profileRepository,
          ),

        updateUserProfileUseCase:
          new UpdateUserProfileUseCase(
            profileRepository,
          ),

        getUsersUseCase:
          new GetUsersUseCase(
            userRepository,
          ),

        deleteUserUseCase:
          new DeleteUserUseCase(
            userRepository,
          ),

        getCurrentUserUseCase:
          new GetCurrentUserUseCase(
            new HttpCurrentUserRepository(
              httpClient,
            ),
          ),

        getActivityLogsUseCase:
          new GetActivityLogsUseCase(
            new HttpActivityLogRepository(
              httpClient,
            ),
          ),

        getOwnAnalyticsUseCase:
          new GetOwnAnalyticsUseCase(
            analyticsRepository,
          ),

        getUserAnalyticsUseCase:
          new GetUserAnalyticsUseCase(
            analyticsRepository,
          ),
      }
    },
    [
      onAuthenticationFailed,
    ],
  )
}
