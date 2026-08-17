import {
  createContext,
} from 'react'

import type {
  Tag,
} from '../../domain/entities/Tag'


export interface TagOptionsContextValue {
  tags: Tag[]
  loading: boolean
  error: string
}


export const TagOptionsContext =
  createContext<TagOptionsContextValue>({
    tags: [],
    loading: false,
    error: '',
  })
