import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router'
import {
  ArrowLeftOutlined,
} from '@ant-design/icons'
import {
  Button,
} from 'antd'

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
    <main className="tags-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            Yönetim
          </span>
          <h1>Tagler</h1>
          <p>
            Ürünlerde kullanılan tagleri oluşturun, filtreleyin ve yönetin.
          </p>
        </div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => {
            navigate('/products')
          }}
        >
          Ürünlere dön
        </Button>
      </div>

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
