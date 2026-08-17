import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import {
  useNavigate,
} from 'react-router'
import {
  App as AntDesignApp,
} from 'antd'

import type { Profile } from '../../domain/entities/Profile'

import type { GetOwnProfileUseCase } from '../../application/usecases/GetOwnProfileUseCase'
import type { UpdateOwnProfileUseCase } from '../../application/usecases/UpdateOwnProfileUseCase'

interface ProfilePageProps {
  getOwnProfileUseCase:
    GetOwnProfileUseCase

  updateOwnProfileUseCase:
    UpdateOwnProfileUseCase
}

function normalizeNullableText(
  value: string,
): string | null {
  const normalized =
    value.trim()

  if (normalized === '') {
    return null
  }

  return normalized
}

export function ProfilePage({
  getOwnProfileUseCase,
  updateOwnProfileUseCase,
}: ProfilePageProps) {
  const navigate =
    useNavigate()
  const { notification } =
    AntDesignApp.useApp()

  const [
    profile,
    setProfile,
  ] =
    useState<Profile | null>(
      null,
    )

  const [
    firstName,
    setFirstName,
  ] =
    useState('')

  const [
    lastName,
    setLastName,
  ] =
    useState('')

  const [bio, setBio] =
    useState('')

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    saving,
    setSaving,
  ] =
    useState(false)

  const [
    error,
    setError,
  ] =
    useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        setError('')

        const result =
          await getOwnProfileUseCase
            .execute()

        setProfile(
          result,
        )

        setFirstName(
          result.firstName ??
            '',
        )

        setLastName(
          result.lastName ??
            '',
        )

        setBio(
          result.bio ??
            '',
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
            'Profil alınamadı',
          )
        }
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [
    getOwnProfileUseCase,
  ])

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')

      const updatedProfile =
        await updateOwnProfileUseCase
          .execute(
            {
              firstName:
                normalizeNullableText(
                  firstName,
                ),

              lastName:
                normalizeNullableText(
                  lastName,
                ),

              bio:
                normalizeNullableText(
                  bio,
                ),
            },
          )

      setProfile(
        updatedProfile,
      )

      setFirstName(
        updatedProfile.firstName ??
          '',
      )

      setLastName(
        updatedProfile.lastName ??
          '',
      )

      setBio(
        updatedProfile.bio ??
          '',
      )

      notification.success({
        message: 'Profil güncellendi',
      })
    } catch (error) {
      notification.error({
        message: 'Profil güncellenemedi',
        description: error instanceof Error
          ? error.message
          : 'Bilinmeyen bir hata oluştu',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main>
        <p>
          Profil yükleniyor...
        </p>
      </main>
    )
  }

  if (
    error !== '' &&
    profile === null
  ) {
    return (
      <main>
        <p>
          Hata: {error}
        </p>

        <button
          type="button"
          onClick={() => {
            navigate(
              '/products',
            )
          }}
        >
          Ürünlere Dön
        </button>
      </main>
    )
  }

  if (profile === null) {
    return null
  }

  return (
    <main>
      <button
        type="button"
        onClick={() => {
          navigate(
            '/products',
          )
        }}
      >
        ← Ürünlere Dön
      </button>

      <h1>
        Profil
      </h1>

      <p>
        Email:{' '}
        <strong>
          {profile.user.email}
        </strong>
      </p>

      <p>
        Kullanıcı UUID:{' '}
        {profile.user.publicId}
      </p>

      <hr />

      <form
        onSubmit={
          handleSubmit
        }
      >
        <div>
          <label>
            Ad
          </label>

          <br />

          <input
            type="text"
            maxLength={100}
            value={
              firstName
            }
            onChange={(event) => {
              setFirstName(
                event.target.value,
              )
            }}
          />
        </div>

        <div>
          <label>
            Soyad
          </label>

          <br />

          <input
            type="text"
            maxLength={100}
            value={
              lastName
            }
            onChange={(event) => {
              setLastName(
                event.target.value,
              )
            }}
          />
        </div>

        <div>
          <label>
            Bio
          </label>

          <br />

          <textarea
            maxLength={500}
            value={bio}
            onChange={(event) => {
              setBio(
                event.target.value,
              )
            }}
          />
        </div>

        <br />

        <button
          type="submit"
          disabled={saving}
        >
          {saving
            ? 'Kaydediliyor...'
            : 'Kaydet'}
        </button>
      </form>

    </main>
  )
}
