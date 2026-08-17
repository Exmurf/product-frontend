import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  ClearOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Dropdown,
  Input,
  InputNumber,
  Modal,
  Space,
  Table,
  Tag,
  type MenuProps,
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

const filterDebounceMs = 400


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
  const [modal, modalContextHolder] =
    Modal.useModal()
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
  const [filterError, setFilterError] =
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

  useEffect(() => {
    const timer = window.setTimeout(() => {
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
      const search =
        searchInput.trim() === ''
          ? undefined
          : searchInput.trim()

      if (
        minPrice !== undefined &&
        maxPrice !== undefined &&
        minPrice > maxPrice
      ) {
        setFilterError(
          'Minimum fiyat maksimum fiyattan büyük olamaz.',
        )
        return
      }

      setFilterError('')
      setQuery((current) => {
        if (
          current.search === search &&
          current.minPrice === minPrice &&
          current.maxPrice === maxPrice &&
          current.minStock === minStock
        ) {
          return current
        }

        return {
          ...current,
          page: 1,
          search,
          minPrice,
          maxPrice,
          minStock,
        }
      })
    }, filterDebounceMs)

    return () => {
      window.clearTimeout(timer)
    }
  }, [
    searchInput,
    minPriceInput,
    maxPriceInput,
    minStockInput,
  ])

  function handleClearFilters() {
    setSearchInput('')
    setMinPriceInput('')
    setMaxPriceInput('')
    setMinStockInput('')
    setFilterError('')
    setActionMessage('')
    setQuery((current) => ({
      ...current,
      page: 1,
      search: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minStock: undefined,
    }))
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

  function getActionMenu(
    product: Product,
  ): MenuProps {
    return {
      items: [
        {
          key: 'detail',
          icon: <EyeOutlined />,
          label: 'Detay',
        },
        {
          key: 'edit',
          icon: <EditOutlined />,
          label: 'Düzenle',
        },
        {
          type: 'divider',
        },
        {
          key: 'delete',
          danger: true,
          icon: <DeleteOutlined />,
          label: 'Sil',
        },
      ],
      onClick: ({ key }) => {
        if (key === 'detail') {
          handleDetail(product.publicId)
          return
        }

        if (key === 'edit') {
          setEditingPublicId(product.publicId)
          return
        }

        if (key === 'delete') {
          modal.confirm({
            title: 'Ürün silinsin mi?',
            content: `${product.name} kalıcı olarak silinecek.`,
            okText: 'Sil',
            cancelText: 'Vazgeç',
            okButtonProps: {
              danger: true,
            },
            onOk: () => {
              return handleDelete(product)
            },
          })
        }
      },
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
        align: 'center',
        width: 140,
        render: (_, product) => (
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            menu={getActionMenu(product)}
          >
            <Button
              icon={<MoreOutlined />}
              loading={
                detailLoadingId ===
                  product.publicId ||
                deletingPublicId ===
                  product.publicId
              }
            >
              İşlemler
            </Button>
          </Dropdown>
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
      {modalContextHolder}
      <div
        className="table-filters product-table-filters"
      >
        <div>
          <label>Ürün ara</label>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Ürün adı"
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value)
            }}
          />
        </div>
        <div>
          <label>Minimum fiyat</label>
          <InputNumber
            min={0}
            precision={2}
            controls={false}
            placeholder="0,00"
            value={
              minPriceInput === ''
                ? null
                : Number(minPriceInput)
            }
            onChange={(value) => {
              setMinPriceInput(
                value === null
                  ? ''
                  : String(value),
              )
            }}
          />
        </div>
        <div>
          <label>Maksimum fiyat</label>
          <InputNumber
            min={0}
            precision={2}
            controls={false}
            placeholder="0,00"
            value={
              maxPriceInput === ''
                ? null
                : Number(maxPriceInput)
            }
            onChange={(value) => {
              setMaxPriceInput(
                value === null
                  ? ''
                  : String(value),
              )
            }}
          />
        </div>
        <div>
          <label>Minimum stok</label>
          <InputNumber
            min={0}
            precision={0}
            controls={false}
            placeholder="0"
            value={
              minStockInput === ''
                ? null
                : Number(minStockInput)
            }
            onChange={(value) => {
              setMinStockInput(
                value === null
                  ? ''
                  : String(value),
              )
            }}
          />
        </div>
        <Button
          icon={<ClearOutlined />}
          disabled={
            searchInput === '' &&
            minPriceInput === '' &&
            maxPriceInput === '' &&
            minStockInput === ''
          }
          onClick={handleClearFilters}
        >
          Filtreleri temizle
        </Button>
      </div>

      {filterError !== '' && (
        <Alert
          showIcon
          type="warning"
          message={filterError}
        />
      )}

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
