import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import {
  DeleteOutlined,
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
} from 'antd'
import {
  useNavigate,
} from 'react-router'

import type {
  DeleteUserUseCase,
} from '../../application/usecases/DeleteUserUseCase'
import type {
  GetUsersUseCase,
} from '../../application/usecases/GetUsersUseCase'
import type {
  AdminUser,
  AdminUserRole,
} from '../../domain/entities/AdminUser'
import type {
  UserQuery,
} from '../../domain/repositories/UserRepository'


interface UsersPageProps {
  getUsersUseCase: GetUsersUseCase
  deleteUserUseCase: DeleteUserUseCase
}


const initialQuery: UserQuery = {
  page: 1,
  pageSize: 20,
}


function parseRole(
  value: string,
): AdminUserRole | undefined {
  return value === 'user' ||
    value === 'admin'
      ? value
      : undefined
}


function parseActive(
  value: string,
): boolean | undefined {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return undefined
}


function formatCreatedAt(
  value: string | null,
): string {
  return value === null
    ? '-'
    : new Date(value)
        .toLocaleString('tr-TR')
}


export function UsersPage({
  getUsersUseCase,
  deleteUserUseCase,
}: UsersPageProps) {
  const navigate = useNavigate()
  const [users, setUsers] =
    useState<AdminUser[]>([])
  const [query, setQuery] =
    useState<UserQuery>(initialQuery)
  const [searchInput, setSearchInput] =
    useState('')
  const [roleInput, setRoleInput] =
    useState('')
  const [activeInput, setActiveInput] =
    useState('')
  const [loading, setLoading] =
    useState(true)
  const [error, setError] =
    useState('')
  const [actionMessage, setActionMessage] =
    useState('')
  const [totalItems, setTotalItems] =
    useState(0)
  const [deletingPublicId, setDeletingPublicId] =
    useState<string | null>(null)
  const [selectedUser, setSelectedUser] =
    useState<AdminUser | null>(null)

  const loadUsers =
    useCallback(
      async () => {
        try {
          setLoading(true)
          setError('')

          const result =
            await getUsersUseCase
              .execute(query)

          setUsers(result.items)
          setTotalItems(result.totalItems)
        } catch (error) {
          setUsers([])
          setTotalItems(0)
          setError(
            error instanceof Error
              ? error.message
              : 'Kullanıcılar alınamadı',
          )
        } finally {
          setLoading(false)
        }
      },
      [getUsersUseCase, query],
    )

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  function handleFilterSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setActionMessage('')
    setQuery((current) => ({
      ...current,
      page: 1,
      search:
        searchInput.trim() === ''
          ? undefined
          : searchInput.trim(),
      role: parseRole(roleInput),
      isActive: parseActive(activeInput),
    }))
  }

  function handleClearFilters() {
    setSearchInput('')
    setRoleInput('')
    setActiveInput('')
    setActionMessage('')
    setQuery(initialQuery)
  }

  async function handleDeleteUser(
    user: AdminUser,
  ) {
    try {
      setDeletingPublicId(user.publicId)
      setActionMessage('')

      await deleteUserUseCase
        .execute(user.publicId)

      setSelectedUser(null)
      setActionMessage(
        `${user.email} kullanıcısı pasifleştirildi.`,
      )
      await loadUsers()
    } catch (error) {
      setActionMessage(
        error instanceof Error
          ? error.message
          : 'Kullanıcı silinemedi',
      )
    } finally {
      setDeletingPublicId(null)
    }
  }

  const columns:
    TableColumnsType<AdminUser> = [
      {
        title: 'E-posta',
        dataIndex: 'email',
        key: 'email',
        width: 260,
      },
      {
        title: 'Rol',
        dataIndex: 'role',
        key: 'role',
        width: 110,
        render: (role: AdminUserRole) => (
          <Tag color={
            role === 'admin'
              ? 'gold'
              : 'blue'
          }>
            {role === 'admin'
              ? 'Admin'
              : 'Kullanıcı'}
          </Tag>
        ),
      },
      {
        title: 'Durum',
        dataIndex: 'isActive',
        key: 'isActive',
        width: 110,
        render: (isActive: boolean) => (
          <Tag color={
            isActive
              ? 'green'
              : 'default'
          }>
            {isActive ? 'Aktif' : 'Pasif'}
          </Tag>
        ),
      },
      {
        title: 'Kayıt tarihi',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 180,
        render: formatCreatedAt,
      },
      {
        title: 'İşlemler',
        key: 'actions',
        fixed: 'right',
        align: 'right',
        width: 180,
        render: (_, user) => (
          <Space>
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedUser(user)
              }}
            >
              Detay
            </Button>
            <Popconfirm
              title="Kullanıcı pasifleştirilsin mi?"
              description={user.email}
              okText="Sil"
              cancelText="Vazgeç"
              okButtonProps={{ danger: true }}
              disabled={!user.isActive}
              onConfirm={() => {
                return handleDeleteUser(user)
              }}
            >
              <Button
                danger
                type="link"
                icon={<DeleteOutlined />}
                disabled={!user.isActive}
                loading={
                  deletingPublicId ===
                  user.publicId
                }
              >
                Sil
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ]

  return (
    <main className="users-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            Yönetim
          </span>
          <h1>Kullanıcılar</h1>
          <p>
            Kullanıcıları filtreleyin, ayrıntılarını görüntüleyin ve erişimlerini yönetin.
          </p>
        </div>
      </div>

      <form
        className="table-filters users-table-filters"
        onSubmit={handleFilterSubmit}
      >
        <div>
          <label>E-posta ara</label>
          <input
            type="text"
            maxLength={255}
            placeholder="user@example.com"
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value)
            }}
          />
        </div>
        <div>
          <label>Rol</label>
          <select
            value={roleInput}
            onChange={(event) => {
              setRoleInput(event.target.value)
            }}
          >
            <option value="">Tümü</option>
            <option value="user">Kullanıcı</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label>Durum</label>
          <select
            value={activeInput}
            onChange={(event) => {
              setActiveInput(event.target.value)
            }}
          >
            <option value="">Tümü</option>
            <option value="true">Aktif</option>
            <option value="false">Pasif</option>
          </select>
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
        />
      )}

      <Table<AdminUser>
        className="data-table"
        rowKey="publicId"
        columns={columns}
        dataSource={users}
        loading={loading}
        scroll={{ x: 900 }}
        locale={{
          emptyText: 'Kullanıcı bulunamadı',
        }}
        pagination={{
          current: query.page,
          pageSize: query.pageSize,
          total: totalItems,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          showTotal: (total) => {
            return `Toplam ${total} kullanıcı`
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

      <Drawer
        title="Kullanıcı detayı"
        width={520}
        open={selectedUser !== null}
        onClose={() => {
          setSelectedUser(null)
        }}
      >
        {selectedUser !== null && (
          <>
            <Descriptions
              bordered
              size="small"
              column={1}
            >
              <Descriptions.Item label="E-posta">
                {selectedUser.email}
              </Descriptions.Item>
              <Descriptions.Item label="UUID">
                {selectedUser.publicId}
              </Descriptions.Item>
              <Descriptions.Item label="Rol">
                {selectedUser.role === 'admin'
                  ? 'Admin'
                  : 'Kullanıcı'}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                {selectedUser.isActive
                  ? 'Aktif'
                  : 'Pasif'}
              </Descriptions.Item>
              <Descriptions.Item label="Kayıt tarihi">
                {formatCreatedAt(
                  selectedUser.createdAt,
                )}
              </Descriptions.Item>
            </Descriptions>

            <Space
              className="drawer-primary-action"
              wrap
            >
              <Button
                type="primary"
                onClick={() => {
                  navigate(
                    `/profiles/${selectedUser.publicId}`,
                  )
                }}
              >
                Profili yönet
              </Button>
              <Button
                onClick={() => {
                  navigate(
                    `/activity-logs?user_public_id=${encodeURIComponent(selectedUser.publicId)}`,
                  )
                }}
              >
                Aktiviteleri gör
              </Button>
            </Space>
          </>
        )}
      </Drawer>
    </main>
  )
}
