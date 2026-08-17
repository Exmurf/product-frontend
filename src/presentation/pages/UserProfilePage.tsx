import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import {
  useNavigate,
  useParams,
} from 'react-router'

import type { Profile } from '../../domain/entities/Profile'

import type { GetUserProfileUseCase } from '../../application/usecases/GetUserProfileUseCase'
import type { UpdateUserProfileUseCase } from '../../application/usecases/UpdateUserProfileUseCase'

interface UserProfilePageProps {
  getUserProfileUseCase:
    GetUserProfileUseCase

  updateUserProfileUseCase:
    UpdateUserProfileUseCase
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

export function UserProfilePage({
  getUserProfileUseCase,
  updateUserProfileUseCase,
}: UserProfilePageProps) {
  const navigate =
    useNavigate()

  const {
    userPublicId,
  } =
    useParams<{
      userPublicId: string
    }>()

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

  const [
    message,
    setMessage,
  ] =
    useState('')

  useEffect(() => {
    async function loadProfile() {
      if (
        userPublicId === undefined
      ) {
        setError(
          'Kullanıcı UUID bulunamadı',
        )

        setLoading(false)

        return
      }

      try {
        setLoading(true)
        setError('')

        const result =
          await getUserProfileUseCase
            .execute(
              userPublicId,
            )

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
            'Kullanıcı profili alınamadı',
          )
        }
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [
    getUserProfileUseCase,
    userPublicId,
  ])

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      userPublicId === undefined
    ) {
      setError(
        'Kullanıcı UUID bulunamadı',
      )

      return
    }

    try {
      setSaving(true)
      setError('')
      setMessage('')

      const updatedProfile =
        await updateUserProfileUseCase
          .execute(
            userPublicId,
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

      setMessage(
        'Kullanıcı profili güncellendi.',
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
          'Kullanıcı profili güncellenemedi',
        )
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main>
        <p>
          Kullanıcı profili yükleniyor...
        </p>
      </main>
    )
  }

  if (
    profile === null
  ) {
    return (
      <main>
        <h1>
          Kullanıcı Profili
        </h1>

        {error !== '' && (
          <p>
            Hata: {error}
          </p>
        )}

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
      </main>
    )
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
        Kullanıcı Profili
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
            : 'Profili Güncelle'}
        </button>
      </form>

      {message !== '' && (
        <p>
          {message}
        </p>
      )}

      {error !== '' && (
        <p>
          Hata: {error}
        </p>
      )}
    </main>
  )
}