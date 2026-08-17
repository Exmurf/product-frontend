import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  ClearOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  StopOutlined,
} from '@ant-design/icons'
import {
  Alert,
  App as AntDesignApp,
  Button,
  Card,
  Descriptions,
  Drawer,
  Dropdown,
  Modal,
  Space,
  Table,
  Tag,
  type MenuProps,
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
  UpdateUserActiveUseCase,
} from '../../application/usecases/UpdateUserActiveUseCase'
import type {
  AdminUser,
  AdminUserRole,
} from '../../domain/entities/AdminUser'
import type {
  UserQuery,
} from '../../domain/repositories/UserRepository'
import {
  PageHeader,
} from '../components/PageHeader'


interface UsersPageProps {
  getUsersUseCase: GetUsersUseCase
  deleteUserUseCase: DeleteUserUseCase
  updateUserActiveUseCase: UpdateUserActiveUseCase
}


const initialQuery: UserQuery = {
  page: 1,
  pageSize: 20,
}

const filterDebounceMs = 400


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
  updateUserActiveUseCase,
}: UsersPageProps) {
  const navigate = useNavigate()
  const { notification } =
    AntDesignApp.useApp()
  const [modal, modalContextHolder] =
    Modal.useModal()
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
  const [deletedInput, setDeletedInput] =
    useState('')
  const [loading, setLoading] =
    useState(true)
  const [error, setError] =
    useState('')
  const [totalItems, setTotalItems] =
    useState(0)
  const [deletingPublicId, setDeletingPublicId] =
    useState<string | null>(null)
  const [updatingPublicId, setUpdatingPublicId] =
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

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const search =
        searchInput.trim() === ''
          ? undefined
          : searchInput.trim()
      const role = parseRole(roleInput)
      const isActive = parseActive(activeInput)
      const isDeleted = parseActive(deletedInput)

      setQuery((current) => {
        if (
          current.search === search &&
          current.role === role &&
          current.isActive === isActive &&
          current.isDeleted === isDeleted
        ) {
          return current
        }

        return {
          ...current,
          page: 1,
          search,
          role,
          isActive,
          isDeleted,
        }
      })
    }, filterDebounceMs)

    return () => {
      window.clearTimeout(timer)
    }
  }, [
    searchInput,
    roleInput,
    activeInput,
    deletedInput,
  ])

  function handleClearFilters() {
    setSearchInput('')
    setRoleInput('')
    setActiveInput('')
    setDeletedInput('')
    setQuery((current) => ({
      page: 1,
      pageSize: current.pageSize,
    }))
  }

  async function handleDeleteUser(
    user: AdminUser,
  ) {
    try {
      setDeletingPublicId(user.publicId)

      await deleteUserUseCase
        .execute(user.publicId)

      setSelectedUser(null)
      notification.success({
        message: 'Kullanıcı silindi',
        description: user.email,
      })
      await loadUsers()
    } catch (error) {
      notification.error({
        message: 'Kullanıcı silinemedi',
        description: error instanceof Error
          ? error.message
          : 'Kullanıcı silinemedi',
      })
    } finally {
      setDeletingPublicId(null)
    }
  }

  async function handleUpdateActive(
    user: AdminUser,
  ) {
    const nextIsActive = !user.isActive

    try {
      setUpdatingPublicId(user.publicId)
      await updateUserActiveUseCase.execute(
        user.publicId,
        nextIsActive,
      )
      setSelectedUser(null)
      notification.success({
        message: nextIsActive
          ? 'Kullanıcı aktifleştirildi'
          : 'Kullanıcı pasifleştirildi',
        description: user.email,
      })
      await loadUsers()
    } catch (error) {
      notification.error({
        message: 'Kullanıcı durumu güncellenemedi',
        description: error instanceof Error
          ? error.message
          : 'Bilinmeyen bir hata oluştu',
      })
    } finally {
      setUpdatingPublicId(null)
    }
  }

  function getActionMenu(
    user: AdminUser,
  ): MenuProps {
    return {
      items: [
        {
          key: 'detail',
          icon: <EyeOutlined />,
          label: 'Detay',
        },
        {
          type: 'divider',
        },
        {
          key: 'toggle-active',
          disabled: user.isDeleted,
          icon: user.isActive
            ? <StopOutlined />
            : <CheckCircleOutlined />,
          label: user.isActive
            ? 'Pasif yap'
            : 'Aktif yap',
        },
        {
          type: 'divider',
        },
        {
          key: 'delete',
          danger: true,
          disabled: user.isDeleted,
          icon: <DeleteOutlined />,
          label: 'Sil',
        },
      ],
      onClick: ({ key }) => {
        if (key === 'detail') {
          setSelectedUser(user)
          return
        }

        if (key === 'toggle-active') {
          modal.confirm({
            title: user.isActive
              ? 'Kullanıcı pasifleştirilsin mi?'
              : 'Kullanıcı aktifleştirilsin mi?',
            content: user.email,
            okText: user.isActive
              ? 'Pasif yap'
              : 'Aktif yap',
            onOk: () => {
              return handleUpdateActive(user)
            },
          })
          return
        }

        if (key === 'delete') {
          modal.confirm({
            title: 'Kullanıcı silinsin mi?',
            content: `${user.email} hesabı silinecek. Bu işlem geri alınamaz.`,
            okText: 'Sil',
            cancelText: 'Vazgeç',
            okButtonProps: {
              danger: true,
            },
            onOk: () => {
              return handleDeleteUser(user)
            },
          })
        }
      },
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
        title: 'Hesap',
        dataIndex: 'isDeleted',
        key: 'isDeleted',
        width: 120,
        render: (isDeleted: boolean) => (
          <Tag color={
            isDeleted
              ? 'red'
              : 'blue'
          }>
            {isDeleted ? 'Silinmiş' : 'Mevcut'}
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
        align: 'center',
        width: 140,
        render: (_, user) => (
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            menu={getActionMenu(user)}
          >
            <Button
              icon={<MoreOutlined />}
              loading={
                deletingPublicId ===
                  user.publicId ||
                updatingPublicId ===
                  user.publicId
              }
            >
              İşlemler
            </Button>
          </Dropdown>
        ),
      },
    ]

  return (
    <main className="users-page">
      {modalContextHolder}
      <PageHeader
        section="Yönetim"
        title="Kullanıcılar"
        description="Kullanıcıları filtreleyin, ayrıntılarını görüntüleyin ve erişimlerini yönetin."
      />

      <Card
        className="management-card"
        title="Kullanıcı listesi"
      >
        <div className="table-filters users-table-filters">
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
          <div>
            <label>Hesap</label>
            <select
              value={deletedInput}
              onChange={(event) => {
                setDeletedInput(event.target.value)
              }}
            >
              <option value="">Tümü</option>
              <option value="false">Mevcut</option>
              <option value="true">Silinmiş</option>
            </select>
          </div>
          <Button
            icon={<ClearOutlined />}
            disabled={
              searchInput === '' &&
              roleInput === '' &&
              activeInput === '' &&
              deletedInput === ''
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

        <Table<AdminUser>
          className="data-table"
          rowKey="publicId"
          columns={columns}
          dataSource={users}
          loading={loading}
          scroll={{ x: 1020 }}
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
      </Card>

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
              <Descriptions.Item label="Hesap">
                {selectedUser.isDeleted
                  ? 'Silinmiş'
                  : 'Mevcut'}
              </Descriptions.Item>
              <Descriptions.Item label="Silinme tarihi">
                {formatCreatedAt(
                  selectedUser.deletedAt,
                )}
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
                disabled={selectedUser.isDeleted}
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
