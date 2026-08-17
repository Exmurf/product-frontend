import {
  useState,
  type FormEvent,
} from 'react'

import type { Product } from '../../domain/entities/Product'
import type { UpdateProductUseCase } from '../../application/usecases/UpdateProductUseCase'

import {
  TagSelector,
} from './TagSelector'
import {
  App as AntDesignApp,
} from 'antd'


interface EditProductFormProps {
  product: Product

  updateProductUseCase:
    UpdateProductUseCase

  onUpdated:
    () => void

  onCancel:
    () => void
}

export function EditProductForm({
  product,
  updateProductUseCase,
  onUpdated,
  onCancel,
}: EditProductFormProps) {
  const { notification } =
    AntDesignApp.useApp()
  const [name, setName] =
    useState(
      product.name,
    )

  const [price, setPrice] =
    useState(
      String(product.price),
    )

  const [stock, setStock] =
    useState(
      String(product.stock),
    )

  const [tags, setTags] =
    useState<string[]>(
      product.tags,
    )

  const [
    description,
    setDescription,
  ] = useState(
    product.detail
      ?.description ??
      '',
  )

  const [brand, setBrand] =
    useState(
      product.detail
        ?.brand ??
        '',
    )

  const [
    warrantyMonths,
    setWarrantyMonths,
  ] = useState(
    product.detail
      ?.warrantyMonths ===
    null ||
    product.detail
      ?.warrantyMonths ===
    undefined
      ? ''
      : String(
          product.detail
            .warrantyMonths,
        ),
  )

  const [loading, setLoading] =
    useState(false)

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setLoading(true)

    const normalizedDescription =
      description.trim() === ''
        ? null
        : description.trim()

    const normalizedBrand =
      brand.trim() === ''
        ? null
        : brand.trim()

    const normalizedWarranty =
      warrantyMonths === ''
        ? null
        : Number(
            warrantyMonths,
          )

    const hasDetail =
      normalizedDescription !==
        null ||
      normalizedBrand !== null ||
      normalizedWarranty !== null

    try {
      await updateProductUseCase.execute(
        product.publicId,
        {
          name: name,
          price: Number(price),
          stock: Number(stock),

          tags:
            tags,

          detail:
            hasDetail
              ? {
                  description:
                    normalizedDescription,

                  brand:
                    normalizedBrand,

                  warrantyMonths:
                    normalizedWarranty,
                }
              : null,
        },
      )

      notification.success({
        message: 'Ürün başarıyla güncellendi',
        description: name,
      })
      onUpdated()
    } catch (error) {
      notification.error({
        message: 'Ürün güncellenemedi',
        description: error instanceof Error
          ? error.message
          : 'Bilinmeyen bir hata oluştu',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="product-edit-form">
      <p className="form-intro">
        Ürün bilgilerini güncelleyin. Yıldızlı alanlar zorunludur.
      </p>
      <form
        onSubmit={handleSubmit}
      >
        <div>
          <label htmlFor="edit-product-name">
            Ürün adı *
          </label>
          <input
            id="edit-product-name"
            type="text"
            value={name}
            placeholder="Ürün adı"
            maxLength={100}
            required
            disabled={loading}
            onChange={(event) => {
              setName(
                event.target.value,
              )
            }}
          />
        </div>

        <div>
          <label htmlFor="edit-product-price">
            Fiyat *
          </label>
          <input
            id="edit-product-price"
            type="number"
            value={price}
            placeholder="0,00"
            min="0"
            step="0.01"
            required
            disabled={loading}
            onChange={(event) => {
              setPrice(
                event.target.value,
              )
            }}
          />
        </div>

        <div>
          <label htmlFor="edit-product-stock">
            Stok *
          </label>
          <input
            id="edit-product-stock"
            type="number"
            value={stock}
            placeholder="0"
            min="0"
            step="1"
            required
            disabled={loading}
            onChange={(event) => {
              setStock(
                event.target.value,
              )
            }}
          />
        </div>

        <TagSelector
          selectedTags={
            tags
          }
          onChange={
            setTags
          }
          disabled={
            loading
          }
        />

        <div>
          <label htmlFor="edit-product-description">
            Açıklama
          </label>
          <textarea
            id="edit-product-description"
            value={description}
            placeholder="Ürün açıklaması"
            maxLength={1000}
            disabled={loading}
            onChange={(event) => {
              setDescription(
                event.target.value,
              )
            }}
          />
        </div>

        <div>
          <label htmlFor="edit-product-brand">
            Marka
          </label>
          <input
            id="edit-product-brand"
            type="text"
            value={brand}
            placeholder="Ürün markası"
            maxLength={100}
            disabled={loading}
            onChange={(event) => {
              setBrand(
                event.target.value,
              )
            }}
          />
        </div>

        <div>
          <label htmlFor="edit-product-warranty">
            Garanti süresi (ay)
          </label>
          <input
            id="edit-product-warranty"
            type="number"
            value={
              warrantyMonths
            }
            min="0"
            step="1"
            placeholder="Örn. 24"
            aria-describedby="edit-product-warranty-help"
            disabled={loading}
            onChange={(event) => {
              setWarrantyMonths(
                event.target.value,
              )
            }}
          />
          <small
            id="edit-product-warranty-help"
            className="field-help"
          >
            Boş bırakırsanız ürün “Garantisi yok” olarak gösterilir.
          </small>
        </div>

        <br />

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? 'Kaydediliyor...'
            : 'Kaydet'}
        </button>

        {' '}

        <button
          type="button"
          disabled={loading}
          onClick={onCancel}
        >
          İptal
        </button>
      </form>

    </div>
  )
}
