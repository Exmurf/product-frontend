import type {
  UserAnalytics,
} from '../../domain/entities/Analytics'

import type {
  AnalyticsQuery,
  AnalyticsRepository,
} from '../../domain/repositories/AnalyticsRepository'


export class GetUserAnalyticsUseCase {
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
    userPublicId: string,
    query: AnalyticsQuery,
  ): Promise<UserAnalytics> {
    const normalizedUserPublicId =
      userPublicId.trim()

    if (
      normalizedUserPublicId === ''
    ) {
      throw new Error(
        'Kullanıcı UUID boş olamaz',
      )
    }

    return await this.analyticsRepository
      .getUser(
        normalizedUserPublicId,
        query,
      )
  }
}