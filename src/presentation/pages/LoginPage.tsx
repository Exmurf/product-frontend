import {
  useState,
  type FormEvent,
} from 'react'

import {
  useNavigate,
} from 'react-router'

import {
  CheckCircleFilled,
  LockOutlined,
  MailOutlined,
  ShopOutlined,
} from '@ant-design/icons'

import {
  Alert,
  Button,
  Input,
  Segmented,
} from 'antd'

import type {
  LoginUseCase,
} from '../../application/usecases/LoginUseCase'

import type {
  RegisterUseCase,
} from '../../application/usecases/RegisterUseCase'


interface LoginPageProps {
  loginUseCase:
    LoginUseCase

  registerUseCase:
    RegisterUseCase

  onLoginSuccess:
    () => void
}


type AuthMode =
  'login' | 'register'


export function LoginPage({
  loginUseCase,
  registerUseCase,
  onLoginSuccess,
}: LoginPageProps) {
  const navigate =
    useNavigate()

  const [
    mode,
    setMode,
  ] =
    useState<AuthMode>(
      'login',
    )

  const [
    email,
    setEmail,
  ] =
    useState('')

  const [
    password,
    setPassword,
  ] =
    useState('')

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState('')

  const [
    loading,
    setLoading,
  ] =
    useState(false)

  const [
    error,
    setError,
  ] =
    useState('')

  const [
    message,
    setMessage,
  ] =
    useState('')


  function switchMode(
    newMode: AuthMode,
  ) {
    setMode(
      newMode,
    )

    setPassword('')

    setConfirmPassword('')

    setError('')

    setMessage('')
  }


  async function handleLogin(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    try {
      setLoading(true)

      setError('')

      setMessage('')

      await loginUseCase
        .execute(
          email,
          password,
        )

      onLoginSuccess()

      navigate(
        '/products',
        {
          replace: true,
        },
      )
    } catch (error) {
      if (
        error instanceof Error
      ) {
        setError(
          error.message,
        )
      } else {
        setError(
          'Giriş yapılamadı',
        )
      }
    } finally {
      setLoading(false)
    }
  }


  async function handleRegister(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      password !==
      confirmPassword
    ) {
      setError(
        'Şifreler eşleşmiyor',
      )

      return
    }

    try {
      setLoading(true)

      setError('')

      setMessage('')

      const user =
        await registerUseCase
          .execute(
            email,
            password,
          )

      setEmail(
        user.email,
      )

      setPassword('')

      setConfirmPassword('')

      setMode(
        'login',
      )

      setMessage(
        'Kayıt başarılı. Şimdi giriş yapabilirsiniz.',
      )
    } catch (error) {
      if (
        error instanceof Error
      ) {
        setError(
          error.message,
        )
      } else {
        setError(
          'Kayıt oluşturulamadı',
        )
      }
    } finally {
      setLoading(false)
    }
  }


  return (
    <main className="auth-page">
      <div className="auth-shell">
        <aside className="auth-aside">
          <div className="auth-brand">
            <span className="brand-mark">
              <ShopOutlined />
            </span>
            Envanter
          </div>

          <div className="auth-aside-copy">
            <h2>
              Ürün operasyonlarınız tek bir yerde.
            </h2>
            <p>
              Stok, ürün, etiket ve kullanıcı hareketlerini sade bir çalışma alanından yönetin.
            </p>
          </div>

          <div className="auth-feature">
            <CheckCircleFilled />
            API sözleşmesiyle senkron ve güvenli
          </div>
        </aside>

        <section className="auth-form-panel">
          <h1>
            {mode === 'login'
              ? 'Tekrar hoş geldiniz'
              : 'Hesabınızı oluşturun'}
          </h1>

          <p>
            {mode === 'login'
              ? 'Çalışma alanınıza devam etmek için giriş yapın.'
              : 'Başlamak için kurumsal bilgilerinizi girin.'}
          </p>

          <Segmented
            className="auth-segmented"
            block
            value={mode}
            options={[
              {
                label: 'Giriş yap',
                value: 'login',
              },
              {
                label: 'Kayıt ol',
                value: 'register',
              },
            ]}
            onChange={(value) => {
              switchMode(
                value as AuthMode,
              )
            }}
          />

          <form
            onSubmit={
              mode === 'login'
                ? handleLogin
                : handleRegister
            }
          >
            <div>
              <label htmlFor="auth-email">
                E-posta
              </label>
              <Input
                id="auth-email"
                type="email"
                size="large"
                required
                autoComplete="email"
                placeholder="ornek@sirket.com"
                prefix={<MailOutlined />}
                value={email}
                onChange={(event) => {
                  setEmail(
                    event.target.value,
                  )
                }}
              />
            </div>

            <div>
              <label htmlFor="auth-password">
                Şifre
              </label>
              <Input.Password
                id="auth-password"
                size="large"
                required
                minLength={
                  mode === 'register'
                    ? 8
                    : 1
                }
                maxLength={128}
                autoComplete={
                  mode === 'login'
                    ? 'current-password'
                    : 'new-password'
                }
                placeholder={
                  mode === 'register'
                    ? 'En az 8 karakter'
                    : 'Şifrenizi girin'
                }
                prefix={<LockOutlined />}
                value={password}
                onChange={(event) => {
                  setPassword(
                    event.target.value,
                  )
                }}
              />
            </div>

            {mode === 'register' && (
              <div>
                <label htmlFor="auth-confirm-password">
                  Şifre tekrarı
                </label>
                <Input.Password
                  id="auth-confirm-password"
                  size="large"
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  placeholder="Şifrenizi tekrar girin"
                  prefix={<LockOutlined />}
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(
                      event.target.value,
                    )
                  }}
                />
              </div>
            )}

            <Button
              className="auth-submit"
              type="primary"
              size="large"
              htmlType="submit"
              loading={loading}
            >
              {mode === 'login'
                ? 'Çalışma alanına gir'
                : 'Hesap oluştur'}
            </Button>
          </form>

          {message !== '' && (
            <Alert
              className="auth-alert"
              type="success"
              showIcon
              message={message}
            />
          )}

          {error !== '' && (
            <Alert
              className="auth-alert"
              type="error"
              showIcon
              message={error}
            />
          )}
        </section>
      </div>
    </main>
  )
}
