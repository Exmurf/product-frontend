import {
  useMemo,
  useState,
  type FormEvent,
} from 'react'

import {
  ClearOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Alert,
  App as AntDesignApp,
  Button,
  Card,
  Drawer,
  Input,
  Popconfirm,
  Table,
  type TableColumnsType,
} from 'antd'

import type {
  CreateTagUseCase,
} from '../../application/usecases/CreateTagUseCase'
import type {
  DeleteTagUseCase,
} from '../../application/usecases/DeleteTagUseCase'
import type {
  Tag,
} from '../../domain/entities/Tag'
import {
  useTagOptions,
} from '../context/useTagOptions'


interface AdminTagManagementProps {
  createTagUseCase: CreateTagUseCase
  deleteTagUseCase: DeleteTagUseCase
  onTagsChanged: () => Promise<void>
}


export function AdminTagManagement({
  createTagUseCase,
  deleteTagUseCase,
  onTagsChanged,
}: AdminTagManagementProps) {
  const { notification } =
    AntDesignApp.useApp()
  const {
    tags,
    loading: tagsLoading,
    error: tagsError,
  } = useTagOptions()

  const [name, setName] =
    useState('')
  const [search, setSearch] =
    useState('')
  const [showCreateForm, setShowCreateForm] =
    useState(false)
  const [creating, setCreating] =
    useState(false)
  const [deletingId, setDeletingId] =
    useState<string | null>(null)

  const filteredTags =
    useMemo(
      () => {
        const normalized =
          search.trim().toLowerCase()

        if (normalized === '') {
          return tags
        }

        return tags.filter(
          (tag) => {
            return tag.name
              .toLowerCase()
              .includes(normalized)
          },
        )
      },
      [tags, search],
    )

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    try {
      setCreating(true)

      const createdTag =
        await createTagUseCase
          .execute(name)

      setName('')
      setShowCreateForm(false)
      notification.success({
        message: 'Tag oluşturuldu',
        description: createdTag.name,
      })
      await onTagsChanged()
    } catch (error) {
      notification.error({
        message: 'Tag oluşturulamadı',
        description: error instanceof Error
          ? error.message
          : 'Tag oluşturulamadı',
      })
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(
    tag: Tag,
  ) {
    try {
      setDeletingId(tag.publicId)

      await deleteTagUseCase
        .execute(tag.publicId)

      notification.success({
        message: 'Tag silindi',
        description: tag.name,
      })
      await onTagsChanged()
    } catch (error) {
      notification.error({
        message: 'Tag silinemedi',
        description: error instanceof Error
          ? error.message
          : 'Tag silinemedi',
      })
    } finally {
      setDeletingId(null)
    }
  }

  const columns:
    TableColumnsType<Tag> = [
      {
        title: 'Tag adı',
        dataIndex: 'name',
        key: 'name',
        sorter: (left, right) => {
          return left.name.localeCompare(
            right.name,
            'tr',
          )
        },
      },
      {
        title: 'UUID',
        dataIndex: 'publicId',
        key: 'publicId',
        responsive: ['md'],
      },
      {
        title: 'İşlem',
        key: 'actions',
        align: 'center',
        width: 120,
        render: (_, tag) => {
          return (
            <Popconfirm
              title="Tag silinsin mi?"
              description={`${tag.name} kalıcı olarak silinecek.`}
              okText="Sil"
              cancelText="Vazgeç"
              okButtonProps={{
                danger: true,
              }}
              onConfirm={() => {
                return handleDelete(tag)
              }}
            >
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                loading={
                  deletingId === tag.publicId
                }
              >
                Sil
              </Button>
            </Popconfirm>
          )
        },
      },
    ]

  return (
    <Card
      className="management-card"
      title="Tag listesi"
      extra={(
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setShowCreateForm(true)
          }}
        >
          Yeni tag ekle
        </Button>
      )}
    >
      <div className="table-filters compact tag-table-filters">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          value={search}
          placeholder="Tag adına göre filtrele"
          onChange={(event) => {
            setSearch(event.target.value)
          }}
        />
        <Button
          icon={<ClearOutlined />}
          disabled={search === ''}
          onClick={() => {
            setSearch('')
          }}
        >
          Filtreleri temizle
        </Button>
      </div>

      {tagsError !== '' && (
        <Alert
          showIcon
          type="error"
          message={tagsError}
        />
      )}

      <Table<Tag>
        className="data-table"
        rowKey="publicId"
        columns={columns}
        dataSource={filteredTags}
        loading={tagsLoading}
        scroll={{ x: 620 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => {
            return `Toplam ${total} tag`
          },
        }}
        locale={{
          emptyText: 'Tag bulunamadı',
        }}
      />

      <Drawer
        title="Yeni tag ekle"
        width={480}
        open={showCreateForm}
        destroyOnHidden
        onClose={() => {
          if (!creating) {
            setShowCreateForm(false)
            setName('')
          }
        }}
      >
        <form
          className="tag-create-form"
          onSubmit={handleSubmit}
        >
          <div>
            <label htmlFor="new-tag-name">
              Tag adı
            </label>
            <Input
              id="new-tag-name"
              value={name}
              maxLength={50}
              required
              autoFocus
              disabled={creating}
              placeholder="Örn. Elektronik"
              onChange={(event) => {
                setName(event.target.value)
              }}
            />
          </div>
          <div className="drawer-form-actions">
            <Button
              onClick={() => {
                setShowCreateForm(false)
                setName('')
              }}
              disabled={creating}
            >
              İptal
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlusOutlined />}
              loading={creating}
            >
              Tag oluştur
            </Button>
          </div>
        </form>
      </Drawer>
    </Card>
  )
}
