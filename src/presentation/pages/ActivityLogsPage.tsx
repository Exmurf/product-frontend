import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  ClearOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Drawer,
  Table,
  Tag,
  type TableColumnsType,
} from 'antd'
import {
  useSearchParams,
} from 'react-router'

import type {
  GetActivityLogsUseCase,
} from '../../application/usecases/GetActivityLogsUseCase'
import type {
  ActivityAction,
  ActivityEntityType,
  ActivityLog,
} from '../../domain/entities/ActivityLog'
import type {
  UserRole,
} from '../../domain/entities/CurrentUser'
import type {
  ActivityLogQuery,
} from '../../domain/repositories/ActivityLogRepository'


interface ActivityLogsPageProps {
  currentUserRole: UserRole
  getActivityLogsUseCase: GetActivityLogsUseCase
}


const actions: ActivityAction[] = [
  'PRODUCT_CREATE',
  'PRODUCT_UPDATE',
  'PRODUCT_DELETE',
  'TAG_CREATE',
  'TAG_DELETE',
  'PROFILE_UPDATE',
  'USER_REGISTER',
  'USER_DELETE',
  'AUTH_LOGIN',
  'AUTH_LOGOUT',
]

const filterDebounceMs = 400


function parseAction(
  value: string,
): ActivityAction | undefined {
  return actions.includes(
    value as ActivityAction,
  )
    ? value as ActivityAction
    : undefined
}


function parseEntityType(
  value: string,
): ActivityEntityType | undefined {
  const types: ActivityEntityType[] = [
    'PRODUCT',
    'TAG',
    'USER',
    'PROFILE',
  ]

  return types.includes(
    value as ActivityEntityType,
  )
    ? value as ActivityEntityType
    : undefined
}


function formatDate(
  value: string | null,
): string {
  return value === null
    ? '-'
    : new Date(value)
        .toLocaleString('tr-TR')
}


function formatJson(
  value: unknown,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return '-'
  }

  return JSON.stringify(
    value,
    null,
    2,
  ) ?? '-'
}


function getActionText(
  action: ActivityAction,
): string {
  const labels:
    Record<ActivityAction, string> = {
      PRODUCT_CREATE: 'Ürün oluşturuldu',
      PRODUCT_UPDATE: 'Ürün güncellendi',
      PRODUCT_DELETE: 'Ürün silindi',
      TAG_CREATE: 'Tag oluşturuldu',
      TAG_DELETE: 'Tag silindi',
      PROFILE_UPDATE: 'Profil güncellendi',
      USER_REGISTER: 'Kullanıcı kayıt oldu',
      USER_DELETE: 'Kullanıcı silindi',
      AUTH_LOGIN: 'Giriş yapıldı',
      AUTH_LOGOUT: 'Çıkış yapıldı',
    }

  return labels[action]
}


function getEntityText(
  entityType: ActivityEntityType,
): string {
  const labels:
    Record<ActivityEntityType, string> = {
      PRODUCT: 'Ürün',
      TAG: 'Tag',
      USER: 'Kullanıcı',
      PROFILE: 'Profil',
    }

  return labels[entityType]
}


export function ActivityLogsPage({
  currentUserRole,
  getActivityLogsUseCase,
}: ActivityLogsPageProps) {
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

  const [query, setQuery] =
    useState<ActivityLogQuery>({
      page: 1,
      pageSize: 20,
      userPublicId:
        initialUserPublicId === ''
          ? undefined
          : initialUserPublicId,
    })
  const [userPublicIdInput, setUserPublicIdInput] =
    useState(initialUserPublicId)
  const [actionInput, setActionInput] =
    useState('')
  const [entityTypeInput, setEntityTypeInput] =
    useState('')
  const [entityIdInput, setEntityIdInput] =
    useState('')
  const [logs, setLogs] =
    useState<ActivityLog[]>([])
  const [loading, setLoading] =
    useState(true)
  const [error, setError] =
    useState('')
  const [totalItems, setTotalItems] =
    useState(0)
  const [selectedLog, setSelectedLog] =
    useState<ActivityLog | null>(null)

  const scope =
    currentUserRole === 'admin'
      ? 'all'
      : 'mine'

  const loadLogs =
    useCallback(
      async () => {
        try {
          setLoading(true)
          setError('')

          const result =
            await getActivityLogsUseCase
              .execute(scope, query)

          setLogs(result.items)
          setTotalItems(result.totalItems)
        } catch (error) {
          setLogs([])
          setTotalItems(0)
          setError(
            error instanceof Error
              ? error.message
              : 'Aktivite kayıtları alınamadı',
          )
        } finally {
          setLoading(false)
        }
      },
      [getActivityLogsUseCase, scope, query],
    )

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const normalizedUserPublicId =
        userPublicIdInput.trim()
      const normalizedEntityId =
        entityIdInput.trim()
      const userPublicId =
        currentUserRole === 'admin' &&
        normalizedUserPublicId !== ''
          ? normalizedUserPublicId
          : undefined
      const action = parseAction(actionInput)
      const entityType =
        parseEntityType(entityTypeInput)
      const entityId =
        normalizedEntityId === ''
          ? undefined
          : normalizedEntityId

      if (currentUserRole === 'admin') {
        setSearchParams(
          userPublicId === undefined
            ? {}
            : {
                user_public_id: userPublicId,
              },
        )
      }

      setQuery((current) => {
        if (
          current.userPublicId === userPublicId &&
          current.action === action &&
          current.entityType === entityType &&
          current.entityId === entityId
        ) {
          return current
        }

        return {
          ...current,
          page: 1,
          userPublicId,
          action,
          entityType,
          entityId,
        }
      })
    }, filterDebounceMs)

    return () => {
      window.clearTimeout(timer)
    }
  }, [
    currentUserRole,
    userPublicIdInput,
    actionInput,
    entityTypeInput,
    entityIdInput,
    setSearchParams,
  ])

  function handleClearFilters() {
    setUserPublicIdInput('')
    setActionInput('')
    setEntityTypeInput('')
    setEntityIdInput('')
    setSearchParams({})
    setQuery((current) => ({
      page: 1,
      pageSize: current.pageSize,
    }))
  }

  const columns:
    TableColumnsType<ActivityLog> = [
      {
        title: 'İşlem',
        dataIndex: 'action',
        key: 'action',
        width: 210,
        render: (action: ActivityAction) => (
          <div>
            <strong>{getActionText(action)}</strong>
            <div>
              <Tag>{action}</Tag>
            </div>
          </div>
        ),
      },
      {
        title: 'Varlık',
        dataIndex: 'entityType',
        key: 'entityType',
        width: 130,
        render: (
          entityType: ActivityEntityType,
        ) => getEntityText(entityType),
      },
      {
        title: 'Varlık ID',
        dataIndex: 'entityId',
        key: 'entityId',
        width: 220,
        ellipsis: true,
        render: (value: string | null) => {
          return value ?? '-'
        },
      },
      ...(currentUserRole === 'admin'
        ? [
            {
              title: 'Kullanıcı UUID',
              dataIndex: 'userPublicId',
              key: 'userPublicId',
              width: 240,
              ellipsis: true,
            },
          ]
        : []),
      {
        title: 'Tarih',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 180,
        render: formatDate,
      },
      {
        title: 'İşlem',
        key: 'detail',
        fixed: 'right',
        align: 'center',
        width: 110,
        render: (_, log) => (
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedLog(log)
            }}
          >
            Detay
          </Button>
        ),
      },
    ]

  return (
    <main className="activity-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            İzleme
          </span>
          <h1>Aktiviteler</h1>
          <p>
            {currentUserRole === 'admin'
              ? 'Tüm kullanıcı hareketlerini filtreleyip inceleyin.'
              : 'Hesabınıza ait hareketleri filtreleyip inceleyin.'}
          </p>
        </div>
      </div>

      <Card
        className="management-card"
        title="Aktivite listesi"
      >
      <div className="table-filters activity-table-filters">
        {currentUserRole === 'admin' && (
          <div>
            <label>Kullanıcı UUID</label>
            <input
              type="text"
              value={userPublicIdInput}
              placeholder="Kullanıcı UUID"
              onChange={(event) => {
                setUserPublicIdInput(
                  event.target.value,
                )
              }}
            />
          </div>
        )}
        <div>
          <label>İşlem</label>
          <select
            value={actionInput}
            onChange={(event) => {
              setActionInput(event.target.value)
            }}
          >
            <option value="">Tümü</option>
            {actions.map((action) => (
              <option
                key={action}
                value={action}
              >
                {action}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Varlık</label>
          <select
            value={entityTypeInput}
            onChange={(event) => {
              setEntityTypeInput(
                event.target.value,
              )
            }}
          >
            <option value="">Tümü</option>
            <option value="PRODUCT">Ürün</option>
            <option value="TAG">Tag</option>
            <option value="USER">Kullanıcı</option>
            <option value="PROFILE">Profil</option>
          </select>
        </div>
        <div>
          <label>Varlık ID</label>
          <input
            type="text"
            value={entityIdInput}
            placeholder="UUID / ID"
            onChange={(event) => {
              setEntityIdInput(event.target.value)
            }}
          />
        </div>
        <Button
          icon={<ClearOutlined />}
          disabled={
            userPublicIdInput === '' &&
            actionInput === '' &&
            entityTypeInput === '' &&
            entityIdInput === ''
          }
          onClick={handleClearFilters}
        >
          Filtreleri temizle
        </Button>
      </div>

      {error !== '' && (
        <Alert
          showIcon
          type="error"
          message={error}
        />
      )}

      <Table<ActivityLog>
        className="data-table"
        rowKey={(log) => {
          return log.id ??
            `${log.userPublicId}-${log.createdAt}-${log.action}`
        }}
        columns={columns}
        dataSource={logs}
        loading={loading}
        scroll={{ x: 1060 }}
        locale={{
          emptyText: 'Aktivite bulunamadı',
        }}
        pagination={{
          current: query.page,
          pageSize: query.pageSize,
          total: totalItems,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          showTotal: (total) => {
            return `Toplam ${total} aktivite`
          },
          onChange: (page, pageSize) => {
            setQuery((current) => ({
              ...current,
              page,
              pageSize,
            }))
          },
        }}
      />
      </Card>

      <Drawer
        title="Aktivite detayı"
        width={680}
        open={selectedLog !== null}
        onClose={() => {
          setSelectedLog(null)
        }}
      >
        {selectedLog !== null && (
          <>
            <Descriptions
              bordered
              size="small"
              column={1}
            >
              <Descriptions.Item label="İşlem">
                {getActionText(selectedLog.action)}
                {' — '}
                {selectedLog.action}
              </Descriptions.Item>
              <Descriptions.Item label="Varlık">
                {getEntityText(
                  selectedLog.entityType,
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Varlık ID">
                {selectedLog.entityId ?? '-'}
              </Descriptions.Item>
              {currentUserRole === 'admin' && (
                <Descriptions.Item label="Kullanıcı UUID">
                  {selectedLog.userPublicId ?? '-'}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Tarih">
                {formatDate(selectedLog.createdAt)}
              </Descriptions.Item>
            </Descriptions>

            <div className="activity-change-grid">
              <div>
                <h3>Eski değer</h3>
                <pre>{formatJson(selectedLog.oldValue)}</pre>
              </div>
              <div>
                <h3>Yeni değer</h3>
                <pre>{formatJson(selectedLog.newValue)}</pre>
              </div>
            </div>
          </>
        )}
      </Drawer>
    </main>
  )
}
