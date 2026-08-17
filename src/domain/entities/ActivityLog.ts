export type ActivityAction =
  | 'PRODUCT_CREATE'
  | 'PRODUCT_UPDATE'
  | 'PRODUCT_DELETE'
  | 'TAG_CREATE'
  | 'TAG_DELETE'
  | 'PROFILE_UPDATE'
  | 'USER_REGISTER'
  | 'USER_DELETE'
  | 'AUTH_LOGIN'
  | 'AUTH_LOGOUT'


export type ActivityEntityType =
  | 'PRODUCT'
  | 'TAG'
  | 'USER'
  | 'PROFILE'


export interface ActivityLog {
  id: number | null

  userPublicId: string | null

  action: ActivityAction

  entityType: ActivityEntityType

  entityId: string | null

  oldValue: unknown

  newValue: unknown

  createdAt: string | null
}
