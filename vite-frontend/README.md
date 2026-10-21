# Vite Frontend (React + Apollo Client)

UI React + Vite + Tailwind + Apollo Client cho demo GraphQL Products.

## Cài đặt

```bash
pnpm install
cp .env.example .env   # VITE_GRAPHQL_URL=http://localhost:3000/graphql
pnpm run dev
```

App: http://localhost:5173

## Scripts

- `pnpm run dev` — dev server (HMR)
- `pnpm run build` — typecheck + build
- `pnpm run lint` — oxlint
- `pnpm run preview` — preview build

## Cấu trúc

- `src/lib/apollo.ts` — ApolloClient (HttpLink + InMemoryCache)
- `src/graphql/products.ts` — operations + fragment ProductFields + types
- `src/types/product.ts` — TS interfaces mirror schema backend
- `src/components/ProductList.tsx`, `ProductForm.tsx` — UI
- `src/App.tsx` — state, queries/mutations, handlers

Xem README gốc để có tài liệu đầy đủ.