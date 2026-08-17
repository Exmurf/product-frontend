import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import type {
  UserRole,
} from './domain/entities/CurrentUser'
import {
  tokenStorage,
  useApplicationServices,
  userSessionStorage,
} from './infrastructure/composition/useApplicationServices'
import {
  AppRoutes,
} from './presentation/routing/AppRoutes'
import {
  App as AntDesignApp,
} from 'antd'


function App() {
  const { notification } =
    AntDesignApp.useApp()
  const [
    currentUserEmail,
    setCurrentUserEmail,
  ] = useState<string | null>(
    () => {
      return userSessionStorage
        .getUserEmail()
    },
  )

  const [
    currentUserRole,
    setCurrentUserRole,
  ] = useState<UserRole | null>(
    () => {
      return userSessionStorage
        .getUserRole()
    },
  )

  const [
    authVersion,
    setAuthVersion,
  ] = useState(0)


  const clearSessionState =
    useCallback(
      () => {
        userSessionStorage
          .clearUser()

        setCurrentUserEmail(
          null,
        )

        setCurrentUserRole(
          null,
        )

        setAuthVersion(
          (version) => {
            return version + 1
          },
        )
      },
      [],
    )


  const services =
    useApplicationServices(
      clearSessionState,
    )


  const isAuthenticated =
    tokenStorage.getAccessToken() !==
      null


  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    let cancelled = false

    async function loadCurrentUser() {
      try {
        const user =
          await services
            .getCurrentUserUseCase
            .execute()

        if (cancelled) {
          return
        }

        userSessionStorage
          .saveUserEmail(
            user.email,
          )

        userSessionStorage
          .saveUserRole(
            user.role,
          )

        setCurrentUserEmail(
          user.email,
        )

        setCurrentUserRole(
          user.role,
        )
      } catch (error) {
        if (cancelled) {
          return
        }

        notification.error({
          message: 'Kullanıcı bilgisi alınamadı',
          description: error instanceof Error
            ? error.message
            : 'Oturum doğrulanamadı',
        })
      }
    }

    loadCurrentUser()

    return () => {
      cancelled = true
    }
  }, [
    isAuthenticated,
    authVersion,
    services.getCurrentUserUseCase,
    notification,
  ])


  function handleLoginSuccess() {
    setCurrentUserEmail(
      userSessionStorage
        .getUserEmail(),
    )

    setCurrentUserRole(
      null,
    )

    setAuthVersion(
      (version) => {
        return version + 1
      },
    )
  }


  function handleLogout() {
    services.logoutUseCase
      .execute()

    clearSessionState()

    notification.success({
      message: 'Çıkış yapıldı',
    })
  }


  return (
    <AppRoutes
      services={services}
      isAuthenticated={
        isAuthenticated
      }
      currentUserEmail={
        currentUserEmail
      }
      currentUserRole={
        currentUserRole
      }
      authVersion={authVersion}
      onLoginSuccess={
        handleLoginSuccess
      }
      onLogout={handleLogout}
    />
  )
}


export default App
