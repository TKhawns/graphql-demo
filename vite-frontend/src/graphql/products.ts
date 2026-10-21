import { gql } from '@apollo/client'
import type { TypedDocumentNode } from '@apollo/client'
import type { Product, CreateProductInput, UpdateProductInput } from '../types/product'

export const PRODUCT_FIELDS = gql`
  fragment ProductFields on Product {
    id
    name
    description
    price
    stock
    category
    createdAt
    updatedAt
  }
`

export type GetProductsQuery = { products: Product[] }
export type GetProductsQueryVariables = Record<string, never>

export const GET_PRODUCTS: TypedDocumentNode<GetProductsQuery, GetProductsQueryVariables> = gql`
  ${PRODUCT_FIELDS}
  query GetProducts {
    products {
      ...ProductFields
    }
  }
`

export type GetProductQuery = { product: Product }
export type GetProductQueryVariables = { id: number }

export const GET_PRODUCT: TypedDocumentNode<GetProductQuery, GetProductQueryVariables> = gql`
  ${PRODUCT_FIELDS}
  query GetProduct($id: Int!) {
    product(id: $id) {
      ...ProductFields
    }
  }
`

export type CreateProductMutation = { createProduct: Product }
export type CreateProductMutationVariables = { input: CreateProductInput }

export const CREATE_PRODUCT: TypedDocumentNode<
  CreateProductMutation,
  CreateProductMutationVariables
> = gql`
  ${PRODUCT_FIELDS}
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      ...ProductFields
    }
  }
`

export type UpdateProductMutation = { updateProduct: Product }
export type UpdateProductMutationVariables = { id: number; input: UpdateProductInput }

export const UPDATE_PRODUCT: TypedDocumentNode<
  UpdateProductMutation,
  UpdateProductMutationVariables
> = gql`
  ${PRODUCT_FIELDS}
  mutation UpdateProduct($id: Int!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      ...ProductFields
    }
  }
`

export type DeleteProductMutation = { deleteProduct: boolean }
export type DeleteProductMutationVariables = { id: number }

export const DELETE_PRODUCT: TypedDocumentNode<
  DeleteProductMutation,
  DeleteProductMutationVariables
> = gql`
  mutation DeleteProduct($id: Int!) {
    deleteProduct(id: $id)
  }
`
