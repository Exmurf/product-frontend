import type {
  ReactNode,
} from 'react'

import type {
  Tag,
} from '../../domain/entities/Tag'
import {
  TagOptionsContext,
} from './TagOptionsContext'


interface TagOptionsProviderProps {
  tags: Tag[]
  loading: boolean
  error: string
  children: ReactNode
}


export function TagOptionsProvider({
  tags,
  loading,
  error,
  children,
}: TagOptionsProviderProps) {
  return (
    <TagOptionsContext.Provider
      value={{
        tags,
        loading,
        error,
      }}
    >
      {children}
    </TagOptionsContext.Provider>
  )
}
