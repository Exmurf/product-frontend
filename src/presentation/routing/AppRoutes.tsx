import {
  Spin,
} from 'antd'

import type {
  ReactNode,
} from 'react'

import {
  Navigate,
  Route,
  Routes,
} from 'react-router'

import type {
  UserRole,
} from '../../domain/entities/CurrentUser'
import type {
  ApplicationServices,
} from '../../infrastructure/composition/useApplicationServices'
import {
  AppShell,
} from '../layout/AppShell'
import {
  ActivityLogsPage,
} from '../pages/ActivityLogsPage'
import {
  AnalyticsPage,
} from '../pages/AnalyticsPage'
import {
  LoginPage,
} from '../pages/LoginPage'
import {
  ProductsPage,
} from '../pages/ProductsPage'
import {
  ProfilePage,
} from '../pages/ProfilePage'
import {
  TagsPage,
} from '../pages/TagsPage'
import {
  UserProfilePage,
} from '../pages/UserProfilePage'
import {
  UsersPage,
} from '../pages/UsersPage'


interface AppRoutesProps {
  services: ApplicationServices
  isAuthenticated: boolean
  currentUserEmail: string | null
  currentUserRole: UserRole | null
  authVersion: number
  onLoginSuccess: () => void
  onLogout: () => void
}


function RouteLoading({
  message,
}: {
  message: string
}) {
  return (
    <main>
      <div className="route-loading">
        <Spin />
        <p>{message}</p>
      </div>
    </main>
  )
}


function AdminOnly({
  role,
  children,
}: {
  role: UserRole | null
  children: ReactNode
}) {
  if (role === null) {
    return (
      <RouteLoading
        message="Yetki kontrol ediliyor..."
      />
    )
  }

  if (role !== 'admin') {
    return (
      <Navigate
        to="/products"
        replace
      />
    )
  }

  return children
}


export function AppRoutes({
  services,
  isAuthenticated,
  currentUserEmail,
  currentUserRole,
  authVersion,
  onLoginSuccess,
  onLogout,
}: AppRoutesProps) {
  const shell =
    !isAuthenticated
      ? (
        <Navigate
          to="/login"
          replace
        />
      )
      : currentUserEmail === null
        ? (
          <RouteLoading
            message="Oturum bilgisi yükleniyor..."
          />
        )
        : (
          <AppShell
            currentUserEmail={
              currentUserEmail
            }
            currentUserRole={
              currentUserRole
            }
            onLogout={onLogout}
          />
        )

  const productsPage =
    currentUserEmail === null
      ? (
        <RouteLoading
          message="Kullanıcı bilgisi yükleniyor..."
        />
      )
      : (
        <ProductsPage
          currentUserEmail={
            currentUserEmail
          }
          currentUserRole={
            currentUserRole
          }
          authVersion={authVersion}
          createProductUseCase={
            services.createProductUseCase
          }
          getProductsUseCase={
            services.getProductsUseCase
          }
          getProductByIdUseCase={
            services.getProductByIdUseCase
          }
          updateProductUseCase={
            services.updateProductUseCase
          }
          deleteProductUseCase={
            services.deleteProductUseCase
          }
          getTagsUseCase={
            services.getTagsUseCase
          }
        />
      )

  const activityPage =
    currentUserRole === null
      ? (
        <RouteLoading
          message="Kullanıcı bilgisi yükleniyor..."
        />
      )
      : (
        <ActivityLogsPage
          currentUserRole={
            currentUserRole
          }
          getActivityLogsUseCase={
            services.getActivityLogsUseCase
          }
        />
      )

  const analyticsPage =
    currentUserRole === null ||
    currentUserEmail === null
      ? (
        <RouteLoading
          message="Kullanıcı bilgisi yükleniyor..."
        />
      )
      : (
        <AnalyticsPage
          currentUserRole={
            currentUserRole
          }
          currentUserEmail={
            currentUserEmail
          }
          getOwnAnalyticsUseCase={
            services.getOwnAnalyticsUseCase
          }
          getUserAnalyticsUseCase={
            services.getUserAnalyticsUseCase
          }
          getUsersUseCase={
            services.getUsersUseCase
          }
        />
      )

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={
              isAuthenticated
                ? '/products'
                : '/login'
            }
            replace
          />
        }
      />

      <Route
        path="/login"
        element={
          isAuthenticated
            ? (
              <Navigate
                to="/products"
                replace
              />
            )
            : (
              <LoginPage
                loginUseCase={
                  services.loginUseCase
                }
                registerUseCase={
                  services.registerUseCase
                }
                onLoginSuccess={
                  onLoginSuccess
                }
              />
            )
        }
      />

      <Route element={shell}>
        <Route
          path="/products"
          element={productsPage}
        />

        <Route
          path="/profile"
          element={
            <ProfilePage
              getOwnProfileUseCase={
                services.getOwnProfileUseCase
              }
              updateOwnProfileUseCase={
                services.updateOwnProfileUseCase
              }
            />
          }
        />

        <Route
          path="/activity-logs"
          element={activityPage}
        />

        <Route
          path="/analytics"
          element={analyticsPage}
        />

        <Route
          path="/tags"
          element={
            <AdminOnly role={currentUserRole}>
              <TagsPage
                getTagsUseCase={
                  services.getTagsUseCase
                }
                createTagUseCase={
                  services.createTagUseCase
                }
                deleteTagUseCase={
                  services.deleteTagUseCase
                }
              />
            </AdminOnly>
          }
        />

        <Route
          path="/users"
          element={
            <AdminOnly role={currentUserRole}>
              <UsersPage
                getUsersUseCase={
                  services.getUsersUseCase
                }
                deleteUserUseCase={
                  services.deleteUserUseCase
                }
              />
            </AdminOnly>
          }
        />

        <Route
          path="/profiles/:userPublicId"
          element={
            <AdminOnly role={currentUserRole}>
              <UserProfilePage
                getUserProfileUseCase={
                  services.getUserProfileUseCase
                }
                updateUserProfileUseCase={
                  services.updateUserProfileUseCase
                }
              />
            </AdminOnly>
          }
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  )
}
