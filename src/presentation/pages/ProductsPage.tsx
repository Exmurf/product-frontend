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

import {
  ProductManagement,
} from '../components/ProductManagement'


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
}: ProductsPageProps) {
  return (
    <main>
      <header className="page-heading">
        <div>
          <span className="eyebrow">
            Ürün kataloğu
          </span>
          <h1>
            Ürünler
          </h1>
          <p>
            Ürünlerinizi, stok seviyelerini ve etiketlerini tek görünümde yönetin.
            {' '}
            <strong>{currentUserEmail}</strong>
            {' '}
            hesabı
            {currentUserRole === 'admin'
              ? ' tüm kayıtları görüntülüyor.'
              : ' kendi kayıtlarını görüntülüyor.'}
          </p>
        </div>
      </header>

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
      />
    </main>
  )
}
