# Flow chạy của 1 request GraphQL

Endpoint: `POST /graphql`

## Tổng quan (sequence)

```
Client
  │  HTTP POST /graphql  { query, variables }
  ▼
NestJS (Express adapter)
  │
  ▼
GraphQLModule (Apollo Driver)
  ├─ parse query (graphql-js)
  ├─ validate against schema (src/schema.gql)
  └─ execute
       │
       ▼
ProductsResolver  (src/products/products.resolver.ts)
  │  @Query / @Mutation handler
  │  Args được bind & validate (class-validator)
  ▼
ProductsService   (src/products/products.service.ts)
  │  business logic
  ▼
TypeORM Repository (Product)
  │  build SQL
  ▼
pg driver ── TCP ──► PostgreSQL
  │  result rows
  ▼
Entity mapping (Product)
  ▼
Resolver returns Product / [Product] / boolean
  │
  ▼
GraphQL executor chọn field theo selection set
  │  serialize (DateTime scalar, Float, Int, ...)
  ▼
HTTP response JSON  { data: {...} }  (hoặc errors)
  │
  ▼
Client
```

## Chi tiết từng bước

### 1. Nhận request HTTP
- `main.ts` bootstrap Nest app với Express.
- Route `POST /graphql` được `GraphQLModule` đăng ký.
- Body JSON `{ query, variables, operationName }`.

### 2. Parse & Validate schema
- Apollo parse chuỗi query thành AST.
- Validate AST với schema tự sinh (`src/schema.gql`).
- Nếu sai cú pháp → trả `errors` (không vào resolver).

### 3. Thực thi (Execution)
- GraphQL xác định operation (query/mutation) và root field.
- Map root field → method trong `ProductsResolver`.
- Arguments được convert/validate qua global `ValidationPipe`
  (`whitelist`, `forbidNonWhitelisted`, `transform`).
- Ví dụ `createProduct(input)` → `CreateProductInput` được validate
  (name bắt buộc, price >= 0, ...).

### 4. Resolver → Service
- `ProductsResolver.createProduct(@Args('input') input)` gọi
  `ProductsService.create(input)`.
- Resolver chỉ là lớp mỏng; logic nằm ở service.

### 5. Service → TypeORM → PostgreSQL
- `productRepository.create(clean)` tạo entity instance.
- `productRepository.save(...)` sinh và chạy `INSERT`.
- TypeORM dùng connection pool của `pg` driver, gửi SQL qua TCP tới Postgres.
- Kết quả row được map thành entity `Product`.

### 6. Trả về & Serialization
- Service trả `Product` cho resolver.
- GraphQL executor chỉ lấy các field có trong selection set của client.
- Scalar `DateTime` (GraphQLISODateTime) serialize `Date` → ISO string.
- Response JSON: `{ "data": { "createProduct": { "id": 1, "name": "..." } } }`.

### 7. Lỗi
- `NotFoundException` (service) → GraphQL error với message rõ ràng.
- Validation fail → lỗi trước khi vào resolver.
- Lỗi DB → GraphQL error `INTERNAL_SERVER_ERROR`.

## Các file liên quan
- `src/main.ts` — bootstrap, global pipes
- `src/app.module.ts` — đăng ký GraphQLModule, TypeOrmModule
- `src/products/products.resolver.ts` — entry point GraphQL
- `src/products/products.service.ts` — business logic
- `src/products/product.entity.ts` — entity + GraphQL type
- `src/products/dto/*.input.ts` — input + validation
- `src/database/data-source.ts` — DataSource cho migrations
- `src/schema.gql` — schema sinh tự động

## Ví dụ trace: `mutation { createProduct(input:{name:"Mouse",price:29.99}) { id name } }`

1. Client POST → Nest nhận.
2. Apollo parse/validate → mutation `createProduct`.
3. Resolver `createProduct(input)` được gọi.
4. `ValidationPipe` validate `CreateProductInput` (name ok, price ok).
5. Service `create`: lọc undefined, `repo.create`, `repo.save`.
6. TypeORM → `INSERT INTO products ... RETURNING *`.
7. Postgres trả row → entity `Product { id:1, name:"Mouse", ... }`.
8. Resolver trả entity.
9. Executor chọn `id`, `name` → JSON response.
10. Client nhận `{ data: { createProduct: { id:1, name:"Mouse" } } }`.
