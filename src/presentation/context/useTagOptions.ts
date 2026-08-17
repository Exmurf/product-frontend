import {
  useContext,
} from 'react'

import {
  TagOptionsContext,
  type TagOptionsContextValue,
} from './TagOptionsContext'


export function useTagOptions():
  TagOptionsContextValue {
  return useContext(
    TagOptionsContext,
  )
}
