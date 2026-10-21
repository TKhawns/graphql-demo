import type { Product } from '../types/product'

interface Props {
  products: Product[]
  onEdit: (p: Product) => void
  onDelete: (id: number) => void
  deletingId?: number | null
}

export function ProductList({ products, onEdit, onDelete, deletingId }: Props) {
  if (products.length === 0) {
    return <p className="text-gray-500">No products yet.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Name</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Category</th>
            <th className="px-4 py-2 text-right font-medium text-gray-700">Price</th>
            <th className="px-4 py-2 text-right font-medium text-gray-700">Stock</th>
            <th className="px-4 py-2 text-right font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-2">
                <div className="font-medium text-gray-900">{p.name}</div>
                {p.description && (
                  <div className="text-xs text-gray-500">{p.description}</div>
                )}
              </td>
              <td className="px-4 py-2 text-gray-600">{p.category ?? '—'}</td>
              <td className="px-4 py-2 text-right text-gray-900">${p.price.toFixed(2)}</td>
              <td className="px-4 py-2 text-right text-gray-900">{p.stock}</td>
              <td className="px-4 py-2 text-right">
                <button
                  onClick={() => onEdit(p)}
                  className="mr-2 text-indigo-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  disabled={deletingId === p.id}
                  className="text-red-600 hover:underline disabled:opacity-50"
                >
                  {deletingId === p.id ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
