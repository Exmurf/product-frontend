import type {
  UserRole,
} from '../../domain/entities/CurrentUser'

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
import type {
  CreateTagUseCase,
} from '../../application/usecases/CreateTagUseCase'
import type {
  DeleteTagUseCase,
} from '../../application/usecases/DeleteTagUseCase'

import {
  ProductManagement,
} from '../components/ProductManagement'
import {
  PageHeader,
} from '../components/PageHeader'


interface ProductsPageProps {
  currentUserEmail: string

  currentUserRole:
    UserRole | null

  authVersion: number

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

  createTagUseCase:
    CreateTagUseCase

  deleteTagUseCase:
    DeleteTagUseCase

}


export function ProductsPage({
  currentUserEmail,
  currentUserRole,
  authVersion,
  createProductUseCase,
  getProductsUseCase,
  getProductByIdUseCase,
  updateProductUseCase,
  deleteProductUseCase,
  getTagsUseCase,
  createTagUseCase,
  deleteTagUseCase,
}: ProductsPageProps) {
  return (
    <main>
      <PageHeader
        section="Envanter"
        title="Ürünler"
        description={(
          <>
            Ürünlerinizi, stok seviyelerini ve etiketlerini tek görünümde yönetin.
            {' '}
            <strong>{currentUserEmail}</strong>
            {' '}
            hesabı
            {currentUserRole === 'admin'
              ? ' tüm kayıtları görüntülüyor.'
              : ' kendi kayıtlarını görüntülüyor.'}
          </>
        )}
      />

      <ProductManagement
        key={authVersion}
        authVersion={
          authVersion
        }
        createProductUseCase={
          createProductUseCase
        }
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
        getTagsUseCase={
          getTagsUseCase
        }
        createTagUseCase={
          createTagUseCase
        }
        deleteTagUseCase={
          deleteTagUseCase
        }
        currentUserRole={
          currentUserRole
        }
      />
    </main>
  )
}
