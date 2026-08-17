import type {
  ActivityLogPage,
  ActivityLogQuery,
  ActivityLogRepository,
} from '../../domain/repositories/ActivityLogRepository'


export type ActivityLogScope =
  'mine' | 'all'


export class GetActivityLogsUseCase {
  private activityLogRepository:
    ActivityLogRepository

  constructor(
    activityLogRepository:
      ActivityLogRepository,
  ) {
    this.activityLogRepository =
      activityLogRepository
  }

  async execute(
    scope: ActivityLogScope,
    query: ActivityLogQuery,
  ): Promise<ActivityLogPage> {
    if (
      !Number.isInteger(
        query.page,
      ) ||
      query.page < 1
    ) {
      throw new Error(
        'Sayfa numarası en az 1 olmalıdır',
      )
    }

    if (
      !Number.isInteger(
        query.pageSize,
      ) ||
      query.pageSize < 1 ||
      query.pageSize > 100
    ) {
      throw new Error(
        'Sayfa boyutu 1 ile 100 arasında olmalıdır',
      )
    }

    if (
      scope === 'mine'
    ) {
      return await this.activityLogRepository
        .getMine(
          query,
        )
    }

    return await this.activityLogRepository
      .getAll(
        query,
      )
  }
}