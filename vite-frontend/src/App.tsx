import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_PRODUCTS, CREATE_PRODUCT, UPDATE_PRODUCT, DELETE_PRODUCT } from './graphql/products'
import type { Product, CreateProductInput, UpdateProductInput } from './types/product'
import { ProductList } from './components/ProductList'
import { ProductForm } from './components/ProductForm'

export default function App() {
  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS)
  const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT)
  const [updateProduct, { loading: updating }] = useMutation(UPDATE_PRODUCT)
  const [deleteProduct] = useMutation(DELETE_PRODUCT)

  const [editing, setEditing] = useState<Product | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleCreate(input: CreateProductInput | UpdateProductInput) {
    await createProduct({ variables: { input: input as CreateProductInput } })
    await refetch()
    setMessage('Product created successfully.')
  }

  async function handleUpdate(input: CreateProductInput | UpdateProductInput) {
    if (!editing) return
    await updateProduct({ variables: { id: editing.id, input: input as UpdateProductInput } })
    setEditing(null)
    await refetch()
    setMessage('Product updated successfully.')
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this product?')) return
    setDeletingId(id)
    try {
      await deleteProduct({ variables: { id } })
      await refetch()
      setMessage('Product deleted.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-indigo-600 py-6 text-white shadow">
        <div className="mx-auto max-w-5xl px-4">
          <h1 className="text-2xl font-bold">GraphQL Products Demo</h1>
          <p className="text-sm text-indigo-100">NestJS + TypeORM + PostgreSQL backend, React + Apollo Client frontend</p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        {message && (
          <div className="rounded border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
            {message}
            <button onClick={() => setMessage(null)} className="ml-2 text-green-900 underline">
              dismiss
            </button>
          </div>
        )}

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error.message}
          </div>
        )}

        <section>
          <ProductForm
            initial={editing}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={editing ? () => setEditing(null) : undefined}
            loading={creating || updating}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Products</h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <ProductList
              products={data?.products ?? []}
              onEdit={setEditing}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          )}
        </section>
      </main>
    </div>
  )
}
