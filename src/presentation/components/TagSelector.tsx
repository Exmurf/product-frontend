import {
  useMemo,
  useState,
} from 'react'

import {
  useTagOptions,
} from '../context/TagOptionsContext'


interface TagSelectorProps {
  selectedTags: string[]

  onChange:
    (tags: string[]) => void

  disabled?: boolean
}


export function TagSelector({
  selectedTags,
  onChange,
  disabled = false,
}: TagSelectorProps) {
  const {
    tags,
    loading,
    error,
  } =
    useTagOptions()

  const [
    pendingTag,
    setPendingTag,
  ] =
    useState('')

  const availableTags =
    useMemo(
      () => {
        return tags.filter(
          (tag) => {
            return !selectedTags
              .includes(
                tag.name,
              )
          },
        )
      },
      [
        tags,
        selectedTags,
      ],
    )

  function handleAddTag() {
    if (
      pendingTag === ''
    ) {
      return
    }

    if (
      selectedTags.length >=
      20
    ) {
      return
    }

    onChange([
      ...selectedTags,
      pendingTag,
    ])

    setPendingTag('')
  }

  function handleRemoveTag(
    tagName: string,
  ) {
    onChange(
      selectedTags.filter(
        (selectedTag) => {
          return (
            selectedTag !==
            tagName
          )
        },
      ),
    )
  }

  return (
    <div className="tag-selector">
      <label>
        Tag'ler
      </label>

      <br />

      {loading && (
        <p>
          Tagler yükleniyor...
        </p>
      )}

      {!loading &&
        error !== '' && (
          <p>
            {error}
          </p>
        )}

      {!loading &&
        error === '' && (
          <>
            <select
              value={
                pendingTag
              }
              disabled={
                disabled ||
                selectedTags.length >=
                  20 ||
                availableTags.length ===
                  0
              }
              onChange={(event) => {
                setPendingTag(
                  event.target.value,
                )
              }}
            >
              <option value="">
                Tag seç
              </option>

              {availableTags.map(
                (tag) => {
                  return (
                    <option
                      key={
                        tag.publicId
                      }
                      value={
                        tag.name
                      }
                    >
                      {tag.name}
                    </option>
                  )
                },
              )}
            </select>

            {' '}

            <button
              type="button"
              disabled={
                disabled ||
                pendingTag === '' ||
                selectedTags.length >=
                  20
              }
              onClick={
                handleAddTag
              }
            >
              Ekle
            </button>
          </>
        )}

      {!loading &&
        error === '' &&
        tags.length === 0 && (
          <p>
            Henüz kullanılabilir tag yok.
          </p>
        )}

      {selectedTags.length > 0 && (
        <div>
          <p>
            Seçilen tagler:
          </p>

          <ul>
            {selectedTags.map(
              (tagName) => {
                return (
                  <li
                    key={
                      tagName
                    }
                  >
                    {tagName}

                    {' '}

                    <button
                      type="button"
                      disabled={
                        disabled
                      }
                      onClick={() => {
                        handleRemoveTag(
                          tagName,
                        )
                      }}
                    >
                      Kaldır
                    </button>
                  </li>
                )
              },
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
