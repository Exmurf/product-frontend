import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import {
  EyeOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Table,
  type TableColumnsType,
} from 'antd'
import {
  useSearchParams,
} from 'react-router'

import type {
  GetOwnAnalyticsUseCase,
} from '../../application/usecases/GetOwnAnalyticsUseCase'
import type {
  GetUserAnalyticsUseCase,
} from '../../application/usecases/GetUserAnalyticsUseCase'
import type {
  GetUsersUseCase,
} from '../../application/usecases/GetUsersUseCase'
import type {
  AdminUser,
} from '../../domain/entities/AdminUser'
import type {
  UserAnalytics,
} from '../../domain/entities/Analytics'
import type {
  UserRole,
} from '../../domain/entities/CurrentUser'
import type {
  AnalyticsQuery,
} from '../../domain/repositories/AnalyticsRepository'


interface AnalyticsPageProps {
  currentUserRole: UserRole
  currentUserEmail: string
  getOwnAnalyticsUseCase: GetOwnAnalyticsUseCase
  getUserAnalyticsUseCase: GetUserAnalyticsUseCase
  getUsersUseCase: GetUsersUseCase
}


function formatDateTime(
  value: string | null,
): string {
  return value === null
    ? '-'
    : new Date(value)
        .toLocaleString('tr-TR')
}


function formatAverage(
  value: number,
): string {
  return value.toFixed(2)
}


export function AnalyticsPage({
  currentUserRole,
  currentUserEmail,
  getOwnAnalyticsUseCase,
  getUserAnalyticsUseCase,
  getUsersUseCase,
}: AnalyticsPageProps) {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams()

  const initialUserPublicId =
    currentUserRole === 'admin'
      ? searchParams.get(
          'user_public_id',
        ) ?? ''
      : ''

  const [targetUserPublicId, setTargetUserPublicId] =
    useState(initialUserPublicId)
  const [selectedUserPublicId, setSelectedUserPublicId] =
    useState(initialUserPublicId)
  const [userOptions, setUserOptions] =
    useState<AdminUser[]>([])
  const [userSearchInput, setUserSearchInput] =
    useState('')
  const [usersLoading, setUsersLoading] =
    useState(false)
  const [usersError, setUsersError] =
    useState('')
  const [startDateInput, setStartDateInput] =
    useState('')
  const [startTimeInput, setStartTimeInput] =
    useState('')
  const [endDateInput, setEndDateInput] =
    useState('')
  const [endTimeInput, setEndTimeInput] =
    useState('')
  const [query, setQuery] =
    useState<AnalyticsQuery>({})
  const [analytics, setAnalytics] =
    useState<UserAnalytics | null>(null)
  const [loading, setLoading] =
    useState(true)
  const [error, setError] =
    useState('')
  const [detailOpen, setDetailOpen] =
    useState(false)

  const viewingAnotherUser =
    currentUserRole === 'admin' &&
    targetUserPublicId !== ''

  const loadUserOptions =
    useCallback(
      async (search = '') => {
        if (currentUserRole !== 'admin') {
          return
        }

        try {
          setUsersLoading(true)
          setUsersError('')

          const normalizedSearch =
            search.trim()
          const result =
            await getUsersUseCase.execute({
              page: 1,
              pageSize: 100,
              search:
                normalizedSearch === ''
                  ? undefined
                  : normalizedSearch,
            })

          setUserOptions(
            result.items.filter((user) => {
              return user.email.toLowerCase() !==
                currentUserEmail.toLowerCase()
            }),
          )
        } catch (error) {
          setUserOptions([])
          setUsersError(
            error instanceof Error
              ? error.message
              : 'Kullanıcılar alınamadı',
          )
        } finally {
          setUsersLoading(false)
        }
      },
      [
        currentUserRole,
        currentUserEmail,
        getUsersUseCase,
      ],
    )

  useEffect(() => {
    if (currentUserRole === 'admin') {
      loadUserOptions()
    }
  }, [currentUserRole, loadUserOptions])

  const loadAnalytics =
    useCallback(
      async () => {
        try {
          setLoading(true)
          setError('')

          const result =
            viewingAnotherUser
              ? await getUserAnalyticsUseCase
                  .execute(
                    targetUserPublicId,
                    query,
                  )
              : await getOwnAnalyticsUseCase
                  .execute(query)

          setAnalytics(result)
        } catch (error) {
          setAnalytics(null)
          setError(
            error instanceof Error
              ? error.message
              : 'Analitik verileri alınamadı',
          )
        } finally {
          setLoading(false)
        }
      },
      [
        viewingAnotherUser,
        targetUserPublicId,
        query,
        getOwnAnalyticsUseCase,
        getUserAnalyticsUseCase,
      ],
    )

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  function handleUserSearch() {
    loadUserOptions(userSearchInput)
    setSelectedUserPublicId('')
  }

  function handleFilterSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (currentUserRole === 'admin') {
      setTargetUserPublicId(
        selectedUserPublicId,
      )
      setSearchParams(
        selectedUserPublicId === ''
          ? {}
          : {
              user_public_id:
                selectedUserPublicId,
            },
      )
    }

    setQuery({
      startDate:
        startDateInput === ''
          ? undefined
          : startDateInput,
      startTime:
        startTimeInput === ''
          ? undefined
          : startTimeInput,
      endDate:
        endDateInput === ''
          ? undefined
          : endDateInput,
      endTime:
        endTimeInput === ''
          ? undefined
          : endTimeInput,
    })
  }

  function handleClearFilters() {
    setStartDateInput('')
    setStartTimeInput('')
    setEndDateInput('')
    setEndTimeInput('')
    setQuery({})

    if (currentUserRole === 'admin') {
      setSelectedUserPublicId('')
      setTargetUserPublicId('')
      setSearchParams({})
    }
  }

  const columns:
    TableColumnsType<UserAnalytics> = [
      {
        title: 'Kullanıcı',
        dataIndex: 'email',
        key: 'email',
        width: 260,
      },
      {
        title: 'Toplam ürün',
        dataIndex: 'totalProducts',
        key: 'totalProducts',
        width: 130,
      },
      {
        title: 'Toplam tag',
        dataIndex: 'totalTags',
        key: 'totalTags',
        width: 120,
      },
      {
        title: 'Günlük ortalama',
        dataIndex: 'averageProductsPerDay',
        key: 'averageProductsPerDay',
        width: 150,
        render: formatAverage,
      },
      {
        title: 'Başlangıç',
        dataIndex: 'startDate',
        key: 'startDate',
        width: 180,
        render: formatDateTime,
      },
      {
        title: 'Bitiş',
        dataIndex: 'endDate',
        key: 'endDate',
        width: 180,
        render: formatDateTime,
      },
      {
        title: 'İşlem',
        key: 'detail',
        fixed: 'right',
        align: 'right',
        width: 110,
        render: () => (
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setDetailOpen(true)
            }}
          >
            Detay
          </Button>
        ),
      },
    ]

  return (
    <main className="analytics-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            Raporlama
          </span>
          <h1>Analitik</h1>
          <p>
            Kullanıcı ve tarih aralığına göre performans verilerini filtreleyin.
          </p>
        </div>
      </div>

      {currentUserRole === 'admin' && (
        <section className="analytics-user-picker">
          <h2>Kullanıcı filtresi</h2>
          <div className="analytics-user-search">
            <label>E-posta ara</label>
            <input
              type="text"
              value={userSearchInput}
              placeholder="user@example.com"
              onChange={(event) => {
                setUserSearchInput(
                  event.target.value,
                )
              }}
            />
            <Button
              icon={<SearchOutlined />}
              loading={usersLoading}
              onClick={handleUserSearch}
            >
              Ara
            </Button>
            <Button
              disabled={usersLoading}
              onClick={() => {
                setUserSearchInput('')
                setSelectedUserPublicId('')
                loadUserOptions()
              }}
            >
              Temizle
            </Button>
          </div>
          <div className="analytics-user-select">
            <label>Kullanıcı</label>
            <select
              value={selectedUserPublicId}
              disabled={usersLoading}
              onChange={(event) => {
                setSelectedUserPublicId(
                  event.target.value,
                )
              }}
            >
              <option value="">
                Kendi hesabım ({currentUserEmail})
              </option>
              {userOptions.map((user) => (
                <option
                  key={user.publicId}
                  value={user.publicId}
                >
                  {user.email} — {user.role}
                  {!user.isActive ? ' — Pasif' : ''}
                </option>
              ))}
            </select>
          </div>
          {usersError !== '' && (
            <Alert
              showIcon
              type="error"
              message={usersError}
            />
          )}
        </section>
      )}

      <form
        className="table-filters analytics-table-filters"
        onSubmit={handleFilterSubmit}
      >
        <div>
          <label>Başlangıç tarihi</label>
          <input
            type="date"
            value={startDateInput}
            onChange={(event) => {
              setStartDateInput(event.target.value)
            }}
          />
        </div>
        <div>
          <label>Başlangıç saati</label>
          <input
            type="time"
            value={startTimeInput}
            onChange={(event) => {
              setStartTimeInput(event.target.value)
            }}
          />
        </div>
        <div>
          <label>Bitiş tarihi</label>
          <input
            type="date"
            value={endDateInput}
            onChange={(event) => {
              setEndDateInput(event.target.value)
            }}
          />
        </div>
        <div>
          <label>Bitiş saati</label>
          <input
            type="time"
            value={endTimeInput}
            onChange={(event) => {
              setEndTimeInput(event.target.value)
            }}
          />
        </div>
        <Button
          type="primary"
          htmlType="submit"
          icon={<SearchOutlined />}
        >
          Uygula
        </Button>
        <Button onClick={handleClearFilters}>
          Temizle
        </Button>
      </form>

      {error !== '' && (
        <Alert
          showIcon
          type="error"
          message={error}
        />
      )}

      <Table<UserAnalytics>
        className="data-table"
        rowKey="userPublicId"
        columns={columns}
        dataSource={
          analytics === null
            ? []
            : [analytics]
        }
        loading={loading}
        scroll={{ x: 1120 }}
        pagination={false}
        locale={{
          emptyText: 'Analitik verisi bulunamadı',
        }}
      />

      <Drawer
        title="Analitik detayı"
        width={560}
        open={detailOpen && analytics !== null}
        onClose={() => {
          setDetailOpen(false)
        }}
      >
        {analytics !== null && (
          <Descriptions
            bordered
            size="small"
            column={1}
          >
            <Descriptions.Item label="Kullanıcı">
              {analytics.email}
            </Descriptions.Item>
            <Descriptions.Item label="Kullanıcı UUID">
              {analytics.userPublicId}
            </Descriptions.Item>
            <Descriptions.Item label="Kayıt tarihi">
              {formatDateTime(analytics.registeredAt)}
            </Descriptions.Item>
            <Descriptions.Item label="İlk ürün">
              {formatDateTime(
                analytics.firstProductCreatedAt,
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Toplam ürün">
              {analytics.totalProducts}
            </Descriptions.Item>
            <Descriptions.Item label="Toplam tag">
              {analytics.totalTags}
            </Descriptions.Item>
            <Descriptions.Item label="Günlük ortalama">
              {formatAverage(
                analytics.averageProductsPerDay,
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Başlangıç">
              {formatDateTime(analytics.startDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Bitiş">
              {formatDateTime(analytics.endDate)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </main>
  )
}
