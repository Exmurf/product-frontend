import type {
  UserAnalytics,
} from '../entities/Analytics'


export interface AnalyticsQuery {
  startDate?: string
  startTime?: string

  endDate?: string
  endTime?: string
}


export interface AnalyticsRepository {
  getMine(
    query: AnalyticsQuery,
  ): Promise<UserAnalytics>

  getUser(
    userPublicId: string,
    query: AnalyticsQuery,
  ): Promise<UserAnalytics>
}