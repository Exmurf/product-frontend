import type {
  ActivityAction,
  ActivityEntityType,
  ActivityLog,
} from '../entities/ActivityLog'


export interface ActivityLogQuery {
  page: number

  pageSize: number

  userPublicId?: string

  action?: ActivityAction

  entityType?: ActivityEntityType

  entityId?: string
}


export interface ActivityLogPage {
  items: ActivityLog[]

  page: number

  pageSize: number

  totalItems: number

  totalPages: number
}


export interface ActivityLogRepository {
  getMine(
    query: ActivityLogQuery,
  ): Promise<ActivityLogPage>

  getAll(
    query: ActivityLogQuery,
  ): Promise<ActivityLogPage>
}