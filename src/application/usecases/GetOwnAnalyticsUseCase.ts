import type {
  UserAnalytics,
} from '../../domain/entities/Analytics'

import type {
  AnalyticsQuery,
  AnalyticsRepository,
} from '../../domain/repositories/AnalyticsRepository'


export class GetOwnAnalyticsUseCase {
  private analyticsRepository:
    AnalyticsRepository

  constructor(
    analyticsRepository:
      AnalyticsRepository,
  ) {
    this.analyticsRepository =
      analyticsRepository
  }

  async execute(
    query: AnalyticsQuery,
  ): Promise<UserAnalytics> {
    return await this.analyticsRepository
      .getMine(
        query,
      )
  }
}