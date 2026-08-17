import {
  useMemo,
  useState,
  type FormEvent,
} from 'react'

import {
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
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
} from '../context/TagOptionsContext'


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
  const {
    tags,
    loading: tagsLoading,
    error: tagsError,
  } = useTagOptions()

  const [name, setName] =
    useState('')
  const [search, setSearch] =
    useState('')
  const [message, setMessage] =
    useState('')
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
      setMessage('')

      const createdTag =
        await createTagUseCase
          .execute(name)

      setName('')
      setMessage(
        `Tag oluşturuldu: ${createdTag.name}`,
      )
      await onTagsChanged()
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Tag oluşturulamadı',
      )
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(
    tag: Tag,
  ) {
    try {
      setDeletingId(tag.publicId)
      setMessage('')

      await deleteTagUseCase
        .execute(tag.publicId)

      setMessage(
        `Tag silindi: ${tag.name}`,
      )
      await onTagsChanged()
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Tag silinemedi',
      )
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
        align: 'right',
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
    <section className="data-table-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            Yönetim
          </span>
          <h2>Tagler</h2>
        </div>
      </div>

      <form
        className="inline-create-form"
        onSubmit={handleSubmit}
      >
        <Input
          value={name}
          maxLength={50}
          required
          disabled={creating}
          placeholder="Yeni tag adı"
          onChange={(event) => {
            setName(event.target.value)
          }}
        />
        <Button
          type="primary"
          htmlType="submit"
          icon={<PlusOutlined />}
          loading={creating}
        >
          Tag oluştur
        </Button>
      </form>

      <div className="table-filters compact">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          value={search}
          placeholder="Tag adına göre filtrele"
          onChange={(event) => {
            setSearch(event.target.value)
          }}
        />
      </div>

      {message !== '' && (
        <Alert
          showIcon
          type="info"
          message={message}
        />
      )}

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
    </section>
  )
}
