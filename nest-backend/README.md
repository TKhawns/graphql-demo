# GraphQL Demo (NestJS + TypeORM + PostgreSQL)

A simple CRUD demo to learn **GraphQL** standard code structure using NestJS,
TypeORM and PostgreSQL. It exposes a **GraphQL API** (Apollo).

## Tech stack

- [NestJS](https://nestjs.com/) 11
- [@nestjs/graphql](https://docs.nestjs.com/graphql/quick-start) (Apollo driver, code-first)
- [TypeORM](https://typeorm.io/) 1.x + PostgreSQL
- class-validator / class-transformer

## Project structure

```
src/
├── main.ts                      # bootstrap, global pipes
├── app.module.ts                # root module (Config, TypeORM, GraphQL)
├── products/
│   ├── product.entity.ts        # TypeORM entity + GraphQL ObjectType
│   ├── products.module.ts
│   ├── products.service.ts      # business logic (repository)
│   ├── products.resolver.ts     # GraphQL queries & mutations
│   └── dto/
│       ├── create-product.input.ts
│       └── update-product.input.ts
└── schema.gql                   # auto-generated GraphQL schema (DO NOT EDIT)
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 14+ running on `localhost:5432`

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create the database (once):

   ```bash
   psql -h localhost -U postgres -c "CREATE DATABASE graphql_demo;"
   # or, if your role is already a superuser:
   psql -h localhost -U "$USER" -c "CREATE DATABASE graphql_demo;"
   ```

3. Configure environment:

   ```bash
   cp .env.example .env
   # edit .env if needed
   ```

4. Run in development:

   ```bash
   pnpm run start:dev
   ```

The app listens on `http://localhost:3000`.

## Useful URLs

| URL | Description |
| --- | --- |
| `http://localhost:3000/graphql` | Apollo GraphQL Playground (interactive) |
| `http://localhost:3000/` | Hello World (health) |

## GraphQL API

### Schema

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

### Example queries / mutations

Create:

```graphql
mutation {
  createProduct(input: {
    name: "Wireless Mouse"
    description: "Ergonomic wireless mouse"
    price: 29.99
    stock: 100
    category: "Electronics"
  }) {
    id
    name
    price
    createdAt
  }
}
```

List:

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

Get one:

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

Update:

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

Delete:

```graphql
mutation {
  deleteProduct(id: 1)
}
```

Using curl:

```bash
curl -X POST http://localhost:3000/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ products { id name price } }"}'
```


## Migrations & seeds

Migrations live in `src/migrations/`. The initial schema migration is
`Initial*.ts`.

```bash
# run pending migrations
pnpm run migration:run

# generate a migration from entity changes
pnpm run migration:generate

# create an empty migration
pnpm run migration:create

# revert the last migration
pnpm run migration:revert

# seed sample products (idempotent: skips if data exists)
pnpm run seed
```

Set `DB_RUN_MIGRATIONS=true` in `.env` to run pending migrations automatically
on application startup.

## Notes

- `synchronize: true` is enabled in non-production so TypeORM auto-creates the
  `products` table. Disable it (and use migrations) for production.
- Validation uses a global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`,
  `transform`).
- Errors such as missing products raise `NotFoundException` (HTTP 404 / GraphQL
  error).
