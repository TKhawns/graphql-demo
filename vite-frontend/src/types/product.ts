export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  stock: number
  category: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateProductInput {
  name: string
  description?: string
  price: number
  stock?: number
  category?: string
}

export interface UpdateProductInput {
  name?: string
  description?: string
  price?: number
  stock?: number
  category?: string
}
