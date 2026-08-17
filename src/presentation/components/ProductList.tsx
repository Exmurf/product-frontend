import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Popconfirm,
  Space,
  Table,
  Tag,
  type TableColumnsType,
  type TableProps,
} from 'antd'
import {
  useNavigate,
} from 'react-router'

import type {
  DeleteProductUseCase,
} from '../../application/usecases/DeleteProductUseCase'
import type {
  GetProductByIdUseCase,
} from '../../application/usecases/GetProductByIdUseCase'
import type {
  GetProductsUseCase,
} from '../../application/usecases/GetProductsUseCase'
import type {
  UpdateProductUseCase,
} from '../../application/usecases/UpdateProductUseCase'
import type {
  Product,
} from '../../domain/entities/Product'
import type {
  ProductQuery,
  ProductSortBy,
} from '../../domain/repositories/ProductRepository'
import {
  EditProductForm,
} from './EditProductForm'


interface ProductListProps {
  getProductsUseCase: GetProductsUseCase
  getProductByIdUseCase: GetProductByIdUseCase
  updateProductUseCase: UpdateProductUseCase
  deleteProductUseCase: DeleteProductUseCase
  authVersion: number
  productVersion: number
  onProductsChanged: () => void
}


const initialQuery: ProductQuery = {
  page: 1,
  pageSize: 10,
  sortBy: 'id',
  sortOrder: 'asc',
}


function getOwnerName(
  product: Product,
): string {
  if (product.owner === null) {
    return '-'
  }

  const fullName = [
    product.owner.firstName,
    product.owner.lastName,
  ]
    .filter(Boolean)
    .join(' ')

  return fullName === ''
    ? product.owner.email
    : fullName
}


function formatDate(
  value: string | null,
): string {
  return value === null
    ? '-'
    : new Date(value)
        .toLocaleString('tr-TR')
}


function formatWarranty(
  product: Product,
): string {
  const warranty =
    product.detail?.warrantyMonths

  return warranty === null ||
    warranty === undefined
      ? 'Garantisi yok'
      : `${warranty} ay`
}


export function ProductList({
  getProductsUseCase,
  getProductByIdUseCase,
  updateProductUseCase,
  deleteProductUseCase,
  authVersion,
  productVersion,
  onProductsChanged,
}: ProductListProps) {
  const navigate = useNavigate()
  const [products, setProducts] =
    useState<Product[]>([])
  const [query, setQuery] =
    useState<ProductQuery>(initialQuery)
  const [searchInput, setSearchInput] =
    useState('')
  const [minPriceInput, setMinPriceInput] =
    useState('')
  const [maxPriceInput, setMaxPriceInput] =
    useState('')
  const [minStockInput, setMinStockInput] =
    useState('')
  const [loading, setLoading] =
    useState(true)
  const [error, setError] =
    useState('')
  const [totalItems, setTotalItems] =
    useState(0)
  const [detailProduct, setDetailProduct] =
    useState<Product | null>(null)
  const [detailLoadingId, setDetailLoadingId] =
    useState<string | null>(null)
  const [editingPublicId, setEditingPublicId] =
    useState<string | null>(null)
  const [deletingPublicId, setDeletingPublicId] =
    useState<string | null>(null)
  const [actionMessage, setActionMessage] =
    useState('')

  const previousProductVersion =
    useRef(productVersion)

  const loadProducts =
    useCallback(
      async (
        showLoading: boolean,
      ) => {
        try {
          if (showLoading) {
            setLoading(true)
          }

          const result =
            await getProductsUseCase
              .execute(query)

          setProducts(result.items)
          setTotalItems(result.totalItems)
          setError('')
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Ürünler alınamadı'

          if (showLoading) {
            setProducts([])
            setTotalItems(0)
            setError(message)
          } else {
            setActionMessage(
              `Liste güncellenemedi: ${message}`,
            )
          }
        } finally {
          if (showLoading) {
            setLoading(false)
          }
        }
      },
      [getProductsUseCase, query],
    )

  useEffect(() => {
    loadProducts(true)
  }, [loadProducts, authVersion])

  useEffect(() => {
    if (
      previousProductVersion.current ===
      productVersion
    ) {
      return
    }

    previousProductVersion.current =
      productVersion
    loadProducts(false)
  }, [productVersion, loadProducts])

  function handleFilterSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const minPrice =
      minPriceInput === ''
        ? undefined
        : Number(minPriceInput)
    const maxPrice =
      maxPriceInput === ''
        ? undefined
        : Number(maxPriceInput)
    const minStock =
      minStockInput === ''
        ? undefined
        : Number(minStockInput)

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      setActionMessage(
        'Minimum fiyat maksimum fiyattan büyük olamaz.',
      )
      return
    }

    setActionMessage('')
    setQuery((current) => ({
      ...current,
      page: 1,
      search:
        searchInput.trim() === ''
          ? undefined
          : searchInput.trim(),
      minPrice,
      maxPrice,
      minStock,
    }))
  }

  function handleClearFilters() {
    setSearchInput('')
    setMinPriceInput('')
    setMaxPriceInput('')
    setMinStockInput('')
    setActionMessage('')
    setQuery(initialQuery)
  }

  const handleTableChange:
    TableProps<Product>['onChange'] = (
      pagination,
      _filters,
      sorter,
      extra,
    ) => {
      const activeSorter =
        Array.isArray(sorter)
          ? sorter[0]
          : sorter

      setQuery((current) => {
        if (
          extra.action === 'sort' &&
          activeSorter.order !== undefined &&
          activeSorter.order !== null &&
          typeof activeSorter.field === 'string' &&
          ['name', 'price', 'stock'].includes(
            activeSorter.field,
          )
        ) {
          return {
            ...current,
            page: 1,
            sortBy:
              activeSorter.field as ProductSortBy,
            sortOrder:
              activeSorter.order === 'descend'
                ? 'desc'
                : 'asc',
          }
        }

        return {
          ...current,
          page:
            pagination.current ?? current.page,
          pageSize:
            pagination.pageSize ??
            current.pageSize,
        }
      })
    }

  async function handleDetail(
    publicId: string,
  ) {
    try {
      setDetailLoadingId(publicId)
      setActionMessage('')
      const product =
        await getProductByIdUseCase
          .execute(publicId)
      setDetailProduct(product)
    } catch (error) {
      setActionMessage(
        error instanceof Error
          ? error.message
          : 'Ürün detayı alınamadı',
      )
    } finally {
      setDetailLoadingId(null)
    }
  }

  async function handleDelete(
    product: Product,
  ) {
    try {
      setDeletingPublicId(product.publicId)
      setActionMessage('')
      await deleteProductUseCase
        .execute(product.publicId)
      setDetailProduct(null)
      setEditingPublicId(null)
      setActionMessage('Ürün silindi.')
      onProductsChanged()
    } catch (error) {
      setActionMessage(
        error instanceof Error
          ? error.message
          : 'Ürün silinemedi',
      )
    } finally {
      setDeletingPublicId(null)
    }
  }

  const columns:
    TableColumnsType<Product> = [
      {
        title: 'Ürün',
        dataIndex: 'name',
        key: 'name',
        width: 220,
        sorter: true,
        sortDirections: [
          'ascend',
          'descend',
          'ascend',
        ],
        sortOrder:
          query.sortBy === 'name'
            ? query.sortOrder === 'asc'
              ? 'ascend'
              : 'descend'
            : null,
      },
      {
        title: 'Fiyat',
        dataIndex: 'price',
        key: 'price',
        width: 120,
        sorter: true,
        sortDirections: [
          'ascend',
          'descend',
          'ascend',
        ],
        sortOrder:
          query.sortBy === 'price'
            ? query.sortOrder === 'asc'
              ? 'ascend'
              : 'descend'
            : null,
        render: (price: number) => {
          return price.toLocaleString(
            'tr-TR',
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            },
          )
        },
      },
      {
        title: 'Stok',
        dataIndex: 'stock',
        key: 'stock',
        width: 90,
        sorter: true,
        sortDirections: [
          'ascend',
          'descend',
          'ascend',
        ],
        sortOrder:
          query.sortBy === 'stock'
            ? query.sortOrder === 'asc'
              ? 'ascend'
              : 'descend'
            : null,
      },
      {
        title: 'Tagler',
        dataIndex: 'tags',
        key: 'tags',
        width: 220,
        render: (tags: string[]) => {
          return tags.length === 0
            ? '-'
            : (
              <Space size={[4, 4]} wrap>
                {tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            )
        },
      },
      {
        title: 'Sahibi',
        key: 'owner',
        width: 210,
        render: (_, product) => {
          return getOwnerName(product)
        },
      },
      {
        title: 'Oluşturulma',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 170,
        responsive: ['lg'],
        render: formatDate,
      },
      {
        title: 'İşlemler',
        key: 'actions',
        fixed: 'right',
        align: 'right',
        width: 250,
        render: (_, product) => (
          <Space wrap>
            <Button
              type="link"
              icon={<EyeOutlined />}
              loading={
                detailLoadingId ===
                product.publicId
              }
              onClick={() => {
                handleDetail(product.publicId)
              }}
            >
              Detay
            </Button>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingPublicId(
                  product.publicId,
                )
              }}
            >
              Düzenle
            </Button>
            <Popconfirm
              title="Ürün silinsin mi?"
              description={`${product.name} kalıcı olarak silinecek.`}
              okText="Sil"
              cancelText="Vazgeç"
              okButtonProps={{ danger: true }}
              onConfirm={() => {
                return handleDelete(product)
              }}
            >
              <Button
                danger
                type="link"
                icon={<DeleteOutlined />}
                loading={
                  deletingPublicId ===
                  product.publicId
                }
              >
                Sil
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ]

  const editingProduct =
    products.find((product) => {
      return product.publicId ===
        editingPublicId
    }) ?? null

  return (
    <div className="product-list">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            Katalog görünümü
          </span>
          <h2>Ürün listesi</h2>
        </div>
        <span className="result-count">
          {totalItems} kayıt
        </span>
      </div>

      <form
        className="table-filters product-table-filters"
        onSubmit={handleFilterSubmit}
      >
        <div>
          <label>Ürün ara</label>
          <input
            type="text"
            placeholder="Ürün adı"
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value)
            }}
          />
        </div>
        <div>
          <label>Minimum fiyat</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={minPriceInput}
            onChange={(event) => {
              setMinPriceInput(event.target.value)
            }}
          />
        </div>
        <div>
          <label>Maksimum fiyat</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={maxPriceInput}
            onChange={(event) => {
              setMaxPriceInput(event.target.value)
            }}
          />
        </div>
        <div>
          <label>Minimum stok</label>
          <input
            type="number"
            min="0"
            step="1"
            value={minStockInput}
            onChange={(event) => {
              setMinStockInput(event.target.value)
            }}
          />
        </div>
        <Button
          type="primary"
          htmlType="submit"
          icon={<SearchOutlined />}
        >
          Filtrele
        </Button>
        <Button onClick={handleClearFilters}>
          Temizle
        </Button>
      </form>

      {actionMessage !== '' && (
        <Alert
          showIcon
          type="info"
          message={actionMessage}
        />
      )}
      {error !== '' && (
        <Alert
          showIcon
          type="error"
          message={error}
          action={
            <Button
              size="small"
              onClick={() => {
                loadProducts(true)
              }}
            >
              Tekrar dene
            </Button>
          }
        />
      )}

      <Table<Product>
        className="data-table"
        rowKey="publicId"
        columns={columns}
        dataSource={products}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 1280 }}
        locale={{
          emptyText: 'Ürün bulunamadı',
        }}
        pagination={{
          current: query.page,
          pageSize: query.pageSize,
          total: totalItems,
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20, 50],
          showTotal: (total) => {
            return `Toplam ${total} ürün`
          },
        }}
      />

      <Drawer
        title="Ürün detayı"
        width={560}
        open={detailProduct !== null}
        onClose={() => {
          setDetailProduct(null)
        }}
      >
        {detailProduct !== null && (
          <>
            <Descriptions
              bordered
              size="small"
              column={1}
            >
              <Descriptions.Item label="Ürün">
                {detailProduct.name}
              </Descriptions.Item>
              <Descriptions.Item label="UUID">
                {detailProduct.publicId}
              </Descriptions.Item>
              <Descriptions.Item label="Fiyat">
                {detailProduct.price.toLocaleString(
                  'tr-TR',
                  {
                    minimumFractionDigits: 2,
                  },
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Stok">
                {detailProduct.stock}
              </Descriptions.Item>
              <Descriptions.Item label="Oluşturulma">
                {formatDate(detailProduct.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Tagler">
                {detailProduct.tags.length === 0
                  ? '-'
                  : detailProduct.tags.join(', ')}
              </Descriptions.Item>
              <Descriptions.Item label="Marka">
                {detailProduct.detail?.brand ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Açıklama">
                {detailProduct.detail?.description ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Garanti">
                {formatWarranty(detailProduct)}
              </Descriptions.Item>
              <Descriptions.Item label="Sahibi">
                {getOwnerName(detailProduct)}
              </Descriptions.Item>
              <Descriptions.Item label="Sahip e-postası">
                {detailProduct.owner?.email ?? '-'}
              </Descriptions.Item>
            </Descriptions>

            {detailProduct.owner !== null && (
              <Button
                type="primary"
                className="drawer-primary-action"
                onClick={() => {
                  navigate(
                    `/profiles/${detailProduct.owner?.publicId}`,
                  )
                }}
              >
                Profili yönet
              </Button>
            )}
          </>
        )}
      </Drawer>

      <Drawer
        title="Ürünü düzenle"
        width={620}
        open={editingProduct !== null}
        destroyOnHidden
        onClose={() => {
          setEditingPublicId(null)
        }}
      >
        {editingProduct !== null && (
          <EditProductForm
            product={editingProduct}
            updateProductUseCase={
              updateProductUseCase
            }
            onUpdated={() => {
              setEditingPublicId(null)
              setActionMessage(
                'Ürün güncellendi.',
              )
              onProductsChanged()
            }}
            onCancel={() => {
              setEditingPublicId(null)
            }}
          />
        )}
      </Drawer>
    </div>
  )
}
