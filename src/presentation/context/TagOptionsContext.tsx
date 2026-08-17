import {
  createContext,
  useContext,
  type ReactNode,
} from 'react'

import type {
  Tag,
} from '../../domain/entities/Tag'


interface TagOptionsContextValue {
  tags: Tag[]
  loading: boolean
  error: string
}


const TagOptionsContext =
  createContext<
    TagOptionsContextValue
  >({
    tags: [],
    loading: false,
    error: '',
  })


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


export function useTagOptions():
  TagOptionsContextValue {
  return useContext(
    TagOptionsContext,
  )
}
