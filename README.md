# GraphQL Demo

Monorepo chứa **backend GraphQL NestJS** và **frontend React (Vite)**, xây dựng như dự án
demo/học tập về **cấu trúc code chuẩn GraphQL** (CRUD trên `Product`).

- `nest-backend/` — NestJS 11 + TypeORM + PostgreSQL + GraphQL (Apollo, code-first)
- `vite-frontend/` — React 19 + Vite + Tailwind + Apollo Client

---

## Mục lục

1. [Lý thuyết GraphQL](#1-lý-thuyết-graphql)
2. [Use case trong demo](#2-use-case-trong-demo)
3. [Backend (`nest-backend`)](#3-backend-nest-backend)
4. [Frontend (`vite-frontend`)](#4-frontend-vite-frontend)
5. [Chạy full stack](#5-chạy-full-stack)
6. [Cấu trúc dự án](#6-cấu-trúc-dự-án)
7. [Xử lý lỗi thường gặp](#7-xử-lý-lỗi-thường-gặp)

---

## 1. Lý thuyết GraphQL

### 1.1 GraphQL

**GraphQL** là ngôn ngữ truy vấn cho API và runtime để thực thi các truy vấn đó trên dữ liệu.
Được Facebook phát triển (2012) và open-source năm 2015. Thay vì expose nhiều endpoint cố định
(như REST), server GraphQL expose **một endpoint duy nhất** (`POST /graphql`) và cho phép
client mô tả chính xác dữ liệu mà nó cần.

Ý tưởng cốt lõi: client gửi một **document** (query/mutation/subscription) mô tả hình dạng
kết quả; server validate theo **schema** và thực thi, trả về JSON có hình dạng khớp với request.

### 1.2 Các khái niệm cốt lõi

| Khái niệm         | Mô tả                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Schema**        | Hợp đồng (SDL hoặc code-first) mô tả types, queries, mutations, subscriptions. Nguồn sự thật duy nhất cho cả client và server. |
| **Type**          | Object types (`type Product`), input types (`input CreateProductInput`), enums, interfaces, unions.                            |
| **Scalar**        | Giá trị nguyên thủy: `Int`, `Float`, `String`, `Boolean`, `ID`, cộng thêm custom (`DateTime`/`GraphQLISODateTime`).            |
| **Query**         | Thao tác đọc (giống GET). Root field được resolver xử lý.                                                                      |
| **Mutation**      | Thao tác ghi (tạo/cập nhật/xóa).                                                                                               |
| **Subscription**  | Push real-time qua WebSocket.                                                                                                  |
| **Resolver**      | Hàm lấy dữ liệu cho một field. Tạo thành cây khớp với query.                                                                   |
| **Arguments**     | Tham số trên field/query (`product(id: Int!)`).                                                                                |
| **Variables**     | Giá trị tham số hóa (`$id: Int!`) truyền riêng — cho phép tái sử dụng & cache.                                                 |
| **Fragment**      | Selection set tái sử dụng (`fragment ProductFields on Product { ... }`).                                                       |
| **Alias**         | Đổi tên field trong response (`cheap: products { ... }`).                                                                      |
| **Directive**     | `@include`, `@skip`, hoặc custom để thay đổi cách thực thi.                                                                    |
| **Introspection** | Truy vấn chính schema (`__schema`, `__type`) — nền tảng cho Playground/GraphiQL và codegen.                                    |

### 1.3 Vòng đời request

```
Client
  │  HTTP POST /graphql  { query, variables, operationName }
  ▼
Server (Express/Nest)
  │
  ▼
GraphQL engine (graphql-js / Apollo)
  ├─ Parse chuỗi query → AST
  ├─ Validate AST theo schema
  └─ Execute
       │
       ▼
     Resolvers (root → nested fields)
       │
       ▼
     Nguồn dữ liệu (DB, service, API khác)
       │
       ▼
     Serialize scalars, shaping response theo selection set
  ▼
HTTP response JSON  { data: {...} }  (hoặc { errors: [...] })
```

Lưu ý:

- **Parse/validate** xảy ra trước khi bất kỳ resolver nào chạy; lỗi cú pháp/schema không chạm tới business logic.
- **Execution** chỉ fetch các field có trong selection set (không over-fetch).
- Lỗi được thu thập theo field; vẫn có thể trả partial data kèm `errors`.

### 1.4 GraphQL vs REST

| Khía cạnh           | REST                                 | GraphQL                                       |
| ------------------- | ------------------------------------ | --------------------------------------------- |
| Endpoints           | Nhiều (`/products`, `/products/:id`) | Một (`/graphql`)                              |
| Hình dạng payload   | Server định nghĩa, cố định           | Client định nghĩa mỗi request                 |
| Over/under-fetching | Phổ biến                             | Tránh được (chỉ request field cần)            |
| Versioning          | `/v1`, `/v2`                         | Tiến hóa schema (deprecate field)             |
| Typing              | Tùy chọn (OpenAPI)                   | Schema tích hợp + introspection               |
| Real-time           | Polling / SSE / WS                   | Subscriptions (khái niệm tích hợp)            |
| Caching             | HTTP cache thân thiện                | Cần client cache (Apollo) / persisted queries |
| Rủi ro N+1          | Ít lộ rõ                             | Cần DataLoader / batching                     |
| Độ phức tạp         | CRUD đơn giản                        | Cần thiết kế schema & kỷ luật resolver        |

### 1.5 Ưu / nhược điểm

**Ưu điểm:** fetch dữ liệu chính xác, typing mạnh, tooling nhờ introspection (Playground,
code generation, typed client), một round-trip cho dữ liệu lồng nhau, tiến hóa backward-compatible.

**Nhược điểm:** cache khó hơn REST, vấn đề N+1, tấn công query complexity/depth (cần giới
hạn depth/complexity), setup nhiều hơn, đường cong học tập.

### 1.6 Khi nào dùng

- Nhiều client (web/mobile) với nhu cầu dữ liệu khác nhau.
- Dữ liệu phức tạp, lồng nhau, quan hệ (tránh REST chatty).
- Frontend iterate nhanh mà không cần thay backend.
- Cần hợp đồng mạnh + client typed tự sinh.

Tránh khi: CRUD đơn giản với client đồng nhất, yêu cầu HTTP caching nặng, hoặc team thiếu
kinh nghiệm GraphQL.

---

## 2. Use case trong demo

Domain: catalog **Product** (id, name, description, price, stock, category, createdAt, updatedAt).

Các operation expose:

| Operation                  | Loại          | Mô tả                                       |
| -------------------------- | ------------- | ------------------------------------------- |
| `products`                 | Query         | Liệt kê tất cả sản phẩm (mới nhất trước)    |
| `product(id)`              | Query         | Lấy một sản phẩm (throw nếu không tìm thấy) |
| `createProduct(input)`     | Mutation      | Tạo sản phẩm (input có validate)            |
| `updateProduct(id, input)` | Mutation      | Cập nhật một phần                           |
| `deleteProduct(id)`        | Mutation      | Xóa; trả `Boolean`                          |
| `__schema` / `__type`      | Introspection | Khám phá schema                             |

## 3. Backend (`nest-backend`)

### 3.1 Tech stack

- NestJS 11
- `@nestjs/graphql` (Apollo driver, **code-first**) — schema tự sinh vào `src/schema.gql`
- TypeORM 1.x + PostgreSQL
- class-validator / class-transformer
- ValidationPipe (global)

### 3.2 Cấu trúc dự án

```
nest-backend/src/
├── main.ts                      # bootstrap, global pipes, CORS
├── app.module.ts                # Config, TypeORM, GraphQLModule
├── products/
│   ├── product.entity.ts        # TypeORM entity + GraphQL ObjectType
│   ├── products.module.ts
│   ├── products.service.ts      # business logic (repository)
│   ├── products.resolver.ts     # GraphQL queries & mutations
│   └── dto/
│       ├── create-product.input.ts
│       └── update-product.input.ts
├── database/data-source.ts      # DataSource cho migrations
├── migrations/                  # TypeORM migrations
├── seeds/seed.ts                # dữ liệu mẫu (idempotent)
└── schema.gql                   # tự sinh (KHÔNG EDIT)
```

### 3.3 Yêu cầu

- Node.js 20+
- pnpm 9+
- PostgreSQL 14+ trên `localhost:5432`

### 3.4 Cài đặt

```bash
cd nest-backend
pnpm install
cp .env.example .env          # chỉnh nếu cần
# tạo DB một lần:
psql -h localhost -U postgres -c "CREATE DATABASE graphql_demo;"
pnpm run migration:run
pnpm run seed
pnpm run start:dev
```

App: `http://localhost:3000` · Playground: `http://localhost:3000/graphql`

### 3.5 Environment (`.env`)

| Biến                | Mặc định       | Mô tả                           |
| ------------------- | -------------- | ------------------------------- |
| `PORT`              | `3000`         | Cổng HTTP                       |
| `NODE_ENV`          | `development`  | Môi trường                      |
| `DB_HOST`           | `localhost`    | Host Postgres                   |
| `DB_PORT`           | `5432`         | Port Postgres                   |
| `DB_USERNAME`       | `example`      | User DB                         |
| `DB_PASSWORD`       | (rỗng)         | Password DB                     |
| `DB_NAME`           | `graphql_demo` | Tên DB                          |
| `DB_LOGGING`        | `false`        | Log SQL                         |
| `DB_RUN_MIGRATIONS` | `false`        | Tự chạy migration khi khởi động |

### 3.6 GraphQL schema (code-first)

```graphql
type Product {
  id: Int!
  name: String!
  description: String
  price: Float!
  stock: Int!
  category: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

input CreateProductInput {
  name: String!
  description: String
  price: Float!
  stock: Int! = 0
  category: String
}

input UpdateProductInput {
  name: String
  description: String
  price: Float
  stock: Int
  category: String
}

type Query {
  products: [Product!]!
  product(id: Int!): Product!
}

type Mutation {
  createProduct(input: CreateProductInput!): Product!
  updateProduct(id: Int!, input: UpdateProductInput!): Product!
  deleteProduct(id: Int!): Boolean!
}
```

### 3.7 Luồng request (tóm tắt)

`Client → Nest/Express → GraphQLModule (parse + validate theo schema) → ProductsResolver →
ProductsService → TypeORM Repository → pg driver → PostgreSQL → entity mapping →
shaping theo selection set → JSON response`. Trace đầy đủ trong `nest-backend/docs/graphql-request-flow.md`.

Hành vi chính:

- Global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) validate input trước resolver.
- `NotFoundException` → lỗi GraphQL có message rõ ràng.
- Lỗi DB → `INTERNAL_SERVER_ERROR`.
- `synchronize: false` (dùng migrations); chỉ `true` ở non-prod nếu bật.

### 3.8 Migrations & seeds

```bash
pnpm run migration:run          # chạy pending
pnpm run migration:generate     # sinh từ thay đổi entity
pnpm run migration:create       # migration rỗng
pnpm run migration:revert       # revert lần cuối
pnpm run seed                   # seed sản phẩm mẫu (idempotent)
```

Đặt `DB_RUN_MIGRATIONS=true` để tự chạy khi khởi động.

### 3.9 Scripts

`build`, `start`, `start:dev`, `start:debug`, `start:prod`, `lint`, `test`, `test:watch`,
`test:cov`, `test:e2e`, `format`, `migration:*`, `seed`.

### 3.10 Ví dụ query

Tạo:

```graphql
mutation {
  createProduct(
    input: {
      name: "Wireless Mouse"
      description: "Ergonomic"
      price: 29.99
      stock: 100
      category: "Electronics"
    }
  ) {
    id
    name
    price
    createdAt
  }
}
```

Liệt kê:

```graphql
query {
  products {
    id
    name
    price
    stock
  }
}
```

Lấy một:

```graphql
query {
  product(id: 1) {
    id
    name
    description
    price
    stock
    category
    updatedAt
  }
}
```

Cập nhật:

```graphql
mutation {
  updateProduct(id: 1, input: { price: 24.99, stock: 80 }) {
    id
    name
    price
    stock
  }
}
```

Xóa:

```graphql
mutation {
  deleteProduct(id: 1)
}
```

curl:

```bash
curl -X POST http://localhost:3000/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ products { id name price } }"}'
```

---

## 4. Frontend (`vite-frontend`)

### 4.1 Tech stack

- React 19 + TypeScript
- Vite 8 + Tailwind CSS 4
- Apollo Client 4 (`@apollo/client`)
- Oxlint

### 4.2 Cấu trúc dự án

```
vite-frontend/src/
├── main.tsx
├── App.tsx                      # state + useQuery/useMutation + handlers
├── lib/apollo.ts                # ApolloClient (HttpLink + InMemoryCache)
├── graphql/products.ts          # operations + fragment ProductFields + types
├── types/product.ts             # TS interfaces (Product, inputs)
└── components/
    ├── ProductList.tsx          # table view
    └── ProductForm.tsx          # form tạo/sửa
```

### 4.3 Cài đặt

```bash
cd vite-frontend
pnpm install
cp .env.example .env           # VITE_GRAPHQL_URL=http://localhost:3000/graphql
pnpm run dev
```

App: `http://localhost:5173`

### 4.4 Apollo client

`src/lib/apollo.ts` tạo `ApolloClient` với `HttpLink` trỏ tới
`VITE_GRAPHQL_URL` (fallback `http://localhost:3000/graphql`) và `InMemoryCache`.

Bọc app bằng `ApolloProvider` (xem `main.tsx`) để `useQuery`/`useMutation` hoạt động.

### 4.5 GraphQL operations

Định nghĩa trong `src/graphql/products.ts` dùng `TypedDocumentNode` để type-safe:

- `GET_PRODUCTS` — `query GetProducts { products { ...ProductFields } }`
- `GET_PRODUCT(id)` — `query GetProduct($id: Int!)`
- `CREATE_PRODUCT(input)` — mutation
- `UPDATE_PRODUCT(id, input)` — mutation
- `DELETE_PRODUCT(id)` — mutation

Fragment `ProductFields` dùng chung giữ selection set nhất quán.

### 4.6 Luồng UI

- `App.tsx` chạy `useQuery(GET_PRODUCTS)`; hiển thị trạng thái loading/error.
- `ProductForm` tạo hoặc sửa (khi set `editing`); submit qua `createProduct`/`updateProduct` rồi `refetch()`.
- `ProductList` render bảng với Edit/Delete; delete confirm rồi gọi `deleteProduct` + `refetch()`.
- Message thành công/lỗi hiển thị trong banner.

### 4.7 Scripts

`dev`, `build` (`tsc -b && vite build`), `lint` (oxlint), `preview`.

### 4.8 Lưu ý

- Tất cả types trong `src/types/product.ts` mirror schema backend.
- Mutation dùng variables; cache refresh qua `refetch()` (có thể thay bằng `cache.modify`/`update`).
- Demo không có auth; CORS bật trên backend.

---

## 5. Chạy full stack

Terminal 1 (backend):

```bash
cd nest-backend && pnpm install && cp .env.example .env
psql -h localhost -U postgres -c "CREATE DATABASE graphql_demo;"
pnpm run migration:run && pnpm run seed
pnpm run start:dev
```

Terminal 2 (frontend):

```bash
cd vite-frontend && pnpm install && cp .env.example .env && pnpm run dev
```

Mở `http://localhost:5173` (frontend) và `http://localhost:3000/graphql` (Playground).

---
