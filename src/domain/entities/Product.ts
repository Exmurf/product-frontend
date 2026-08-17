export interface ProductDetail {
  description: string | null
  brand: string | null
  warrantyMonths: number | null
}

export interface ProductOwner {
  publicId: string
  firstName: string | null
  lastName: string | null
  email: string
}

export interface Product {
  publicId: string
  name: string
  price: number
  stock: number
  owner: ProductOwner | null
  createdAt: string | null
  tags: string[]
  detail: ProductDetail | null
}