import {
  useState,
  type FormEvent,
} from 'react'

import type { CreateProductUseCase } from '../../application/usecases/CreateProductUseCase'

import {
  TagSelector,
} from './TagSelector'
import {
  App as AntDesignApp,
} from 'antd'


interface CreateProductFormProps {
  createProductUseCase:
    CreateProductUseCase

  onProductCreated:
    () => void

  onCancel:
    () => void
}

export function CreateProductForm({
  createProductUseCase,
  onProductCreated,
  onCancel,
}: CreateProductFormProps) {
  const { notification } =
    AntDesignApp.useApp()
  const [name, setName] =
    useState('')

  const [price, setPrice] =
    useState('')

  const [stock, setStock] =
    useState('')

  const [tags, setTags] =
    useState<string[]>([])

  const [
    description,
    setDescription,
  ] =
    useState('')

  const [brand, setBrand] =
    useState('')

  const [
    warrantyMonths,
    setWarrantyMonths,
  ] =
    useState('')

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
      await createProductUseCase
        .execute(
          {
            name:
              name,

            price:
              Number(price),

            stock:
              Number(stock),

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
        message: 'Ürün oluşturuldu',
        description: name,
      })
      onProductCreated()
    } catch (error) {
      notification.error({
        message: 'Ürün oluşturulamadı',
        description: error instanceof Error
          ? error.message
          : 'Bilinmeyen bir hata oluştu',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>
        Yeni Ürün
      </h2>

      <p className="form-required-note">
        <span aria-hidden="true">*</span>
        {' '}
        Zorunlu alanlar
      </p>

      <form
        onSubmit={
          handleSubmit
        }
      >
        <div>
          <label
            className="field-label-required"
            htmlFor="create-product-name"
          >
            Ürün adı
          </label>

          <br />

          <input
            id="create-product-name"
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
          <label
            className="field-label-required"
            htmlFor="create-product-price"
          >
            Fiyat
          </label>

          <br />

          <input
            id="create-product-price"
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
          <label
            className="field-label-required"
            htmlFor="create-product-stock"
          >
            Stok
          </label>

          <br />

          <input
            id="create-product-stock"
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
          <label>
            Açıklama
          </label>

          <br />

          <textarea
            value={
              description
            }
            maxLength={1000}
            onChange={(event) => {
              setDescription(
                event.target.value,
              )
            }}
          />
        </div>

        <div>
          <label>
            Marka
          </label>

          <br />

          <input
            type="text"
            value={brand}
            maxLength={100}
            onChange={(event) => {
              setBrand(
                event.target.value,
              )
            }}
          />
        </div>

        <div>
          <label>
            Garanti süresi
            (ay)
          </label>

          <br />

          <input
            type="number"
            value={
              warrantyMonths
            }
            min="0"
            step="1"
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
            ? 'Oluşturuluyor...'
            : 'Ürünü Kaydet'}
        </button>

        {' '}

        <button
          type="button"
          disabled={loading}
          onClick={
            onCancel
          }
        >
          İptal
        </button>
      </form>

    </div>
  )
}
