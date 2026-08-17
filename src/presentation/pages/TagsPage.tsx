import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router'

import type {
  Tag,
} from '../../domain/entities/Tag'

import type {
  GetTagsUseCase,
} from '../../application/usecases/GetTagsUseCase'

import type {
  CreateTagUseCase,
} from '../../application/usecases/CreateTagUseCase'
import type {
  DeleteTagUseCase,
} from '../../application/usecases/DeleteTagUseCase'

import {
  AdminTagManagement,
} from '../components/AdminTagManagement'

import {
  TagOptionsProvider,
} from '../context/TagOptionsContext'


interface TagsPageProps {
  getTagsUseCase:
    GetTagsUseCase

  createTagUseCase:
    CreateTagUseCase

  deleteTagUseCase:
    DeleteTagUseCase
}


export function TagsPage({
  getTagsUseCase,
  createTagUseCase,
  deleteTagUseCase,
}: TagsPageProps) {
  const navigate =
    useNavigate()

  const [
    tags,
    setTags,
  ] =
    useState<Tag[]>([])

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    error,
    setError,
  ] =
    useState('')

  const loadTags =
    useCallback(
      async () => {
        try {
          setLoading(
            true,
          )

          setError('')

          const result =
            await getTagsUseCase
              .execute()

          setTags(
            result,
          )
        } catch (error) {
          setTags([])

          if (
            error instanceof Error
          ) {
            setError(
              error.message,
            )
          } else {
            setError(
              'Tagler alınamadı',
            )
          }
        } finally {
          setLoading(
            false,
          )
        }
      },
      [
        getTagsUseCase,
      ],
    )

  useEffect(() => {
    loadTags()
  }, [
    loadTags,
  ])

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
        Tagler
      </h1>

      <TagOptionsProvider
        tags={tags}
        loading={loading}
        error={error}
      >
        <AdminTagManagement
          createTagUseCase={
            createTagUseCase
          }
          deleteTagUseCase={
            deleteTagUseCase
          }
          onTagsChanged={
            loadTags
          }
        />
      </TagOptionsProvider>
    </main>
  )
}
