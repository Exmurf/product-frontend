import {
  useState,
  type FormEvent,
} from 'react'

import type { Product } from '../../domain/entities/Product'
import type { UpdateProductUseCase } from '../../application/usecases/UpdateProductUseCase'

import {
  TagSelector,
} from './TagSelector'


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

  const [message, setMessage] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setLoading(true)
    setMessage('')

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

      onUpdated()
    } catch (error) {
      if (
        error instanceof Error
      ) {
        setMessage(
          error.message,
        )
      } else {
        setMessage(
          'Bilinmeyen bir hata oluştu',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h4>
        Ürünü Düzenle
      </h4>

      <form
        onSubmit={handleSubmit}
      >
        <div>
          <input
            type="text"
            value={name}
            maxLength={100}
            required
            onChange={(event) => {
              setName(
                event.target.value,
              )
            }}
          />
        </div>

        <div>
          <input
            type="number"
            value={price}
            min="0"
            step="0.01"
            required
            onChange={(event) => {
              setPrice(
                event.target.value,
              )
            }}
          />
        </div>

        <div>
          <input
            type="number"
            value={stock}
            min="0"
            step="1"
            required
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
          <textarea
            value={description}
            placeholder="Açıklama"
            maxLength={1000}
            onChange={(event) => {
              setDescription(
                event.target.value,
              )
            }}
          />
        </div>

        <div>
          <input
            type="text"
            value={brand}
            placeholder="Marka"
            maxLength={100}
            onChange={(event) => {
              setBrand(
                event.target.value,
              )
            }}
          />
        </div>

        <div>
          <input
            type="number"
            value={
              warrantyMonths
            }
            min="0"
            step="1"
            placeholder="Garanti ay"
            onChange={(event) => {
              setWarrantyMonths(
                event.target.value,
              )
            }}
          />
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

      {message !== '' && (
        <p>
          {message}
        </p>
      )}
    </div>
  )
}
