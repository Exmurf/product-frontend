import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import type {
  Tag,
} from '../../domain/entities/Tag'

import type {
  CreateProductUseCase,
} from '../../application/usecases/CreateProductUseCase'

import type {
  GetProductsUseCase,
} from '../../application/usecases/GetProductsUseCase'

import type {
  GetProductByIdUseCase,
} from '../../application/usecases/GetProductByIdUseCase'

import type {
  UpdateProductUseCase,
} from '../../application/usecases/UpdateProductUseCase'

import type {
  DeleteProductUseCase,
} from '../../application/usecases/DeleteProductUseCase'

import type {
  GetTagsUseCase,
} from '../../application/usecases/GetTagsUseCase'

import {
  CreateProductForm,
} from './CreateProductForm'

import {
  ProductList,
} from './ProductList'

import {
  TagOptionsProvider,
} from '../context/TagOptionsContext'

import {
  PlusOutlined,
} from '@ant-design/icons'

import {
  Button,
  Card,
  Drawer,
} from 'antd'


interface ProductManagementProps {
  createProductUseCase:
    CreateProductUseCase

  getProductsUseCase:
    GetProductsUseCase

  getProductByIdUseCase:
    GetProductByIdUseCase

  updateProductUseCase:
    UpdateProductUseCase

  deleteProductUseCase:
    DeleteProductUseCase

  getTagsUseCase:
    GetTagsUseCase

  authVersion: number
}


export function ProductManagement({
  createProductUseCase,
  getProductsUseCase,
  getProductByIdUseCase,
  updateProductUseCase,
  deleteProductUseCase,
  getTagsUseCase,
  authVersion,
}: ProductManagementProps) {
  const [
    productVersion,
    setProductVersion,
  ] =
    useState(0)

  const [
    showCreateForm,
    setShowCreateForm,
  ] =
    useState(false)

  const [
    tags,
    setTags,
  ] =
    useState<Tag[]>([])

  const [
    tagsLoading,
    setTagsLoading,
  ] =
    useState(true)

  const [
    tagsError,
    setTagsError,
  ] =
    useState('')

  const loadTags =
    useCallback(
      async () => {
        try {
          setTagsLoading(
            true,
          )

          const result =
            await getTagsUseCase
              .execute()

          setTags(
            result,
          )

          setTagsError('')
        } catch (error) {
          setTags([])

          if (
            error instanceof Error
          ) {
            setTagsError(
              error.message,
            )
          } else {
            setTagsError(
              'Tagler alınamadı',
            )
          }
        } finally {
          setTagsLoading(
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
    authVersion,
  ])

  function handleProductsChanged() {
    setProductVersion(
      (currentVersion) => {
        return (
          currentVersion + 1
        )
      },
    )
  }

  function handleProductCreated() {
    setShowCreateForm(
      false,
    )

    handleProductsChanged()
  }

  return (
    <TagOptionsProvider
      tags={tags}
      loading={
        tagsLoading
      }
      error={
        tagsError
      }
    >
      <div className="product-management">
        <Card
          className="management-card product-management-card"
          title="Ürün listesi"
          extra={(
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setShowCreateForm(true)
              }}
            >
              Yeni ürün ekle
            </Button>
          )}
        >
          <ProductList
            getProductsUseCase={
              getProductsUseCase
            }
            getProductByIdUseCase={
              getProductByIdUseCase
            }
            updateProductUseCase={
              updateProductUseCase
            }
            deleteProductUseCase={
              deleteProductUseCase
            }
            authVersion={
              authVersion
            }
            productVersion={
              productVersion
            }
            onProductsChanged={
              handleProductsChanged
            }
          />
        </Card>

        <Drawer
          title="Yeni ürün ekle"
          width={680}
          open={showCreateForm}
          destroyOnHidden
          onClose={() => {
            setShowCreateForm(false)
          }}
        >
          {showCreateForm && (
            <CreateProductForm
              createProductUseCase={
                createProductUseCase
              }
              onProductCreated={
                handleProductCreated
              }
              onCancel={() => {
                setShowCreateForm(
                  false,
                )
              }}
            />
          )}
        </Drawer>
      </div>
    </TagOptionsProvider>
  )
}
