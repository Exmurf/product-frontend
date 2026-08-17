export interface UserAnalytics {
  userPublicId: string
  email: string

  registeredAt: string

  firstProductCreatedAt:
    string | null

  totalProducts: number
  totalTags: number

  averageProductsPerDay: number

  startDate: string
  endDate: string
}