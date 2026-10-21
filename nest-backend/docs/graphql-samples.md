# GraphQL Sample Use Cases

Endpoint: `POST http://localhost:3000/graphql`
Content-Type: `application/json`

Body format:

```json
{ "query": "..." }
```

Variables can be passed via `"variables": { ... }`.

---

## 1. Health check (REST)

```bash
curl http://localhost:3000/
```

Expected: `Hello World!`

---

## 2. List all products

```graphql
query {
  products {
    id
    name
    description
    price
    stock
    category
    createdAt
    updatedAt
  }
}
```

curl:

```bash
curl -X POST http://localhost:3000/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ products { id name price stock category } }"}'
```

---

## 3. Get a single product

```graphql
query {
  product(id: 1) {
    id
    name
    price
    stock
  }
}
```

---

## 4. Create a product

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
    stock
    category
    createdAt
  }
}
```

With variables:

```graphql
mutation CreateProduct($input: CreateProductInput!) {
  createProduct(input: $input) {
    id
    name
    price
    stock
  }
}
```

Variables:

```json
{
  "input": {
    "name": "Mechanical Keyboard",
    "description": "RGB mechanical keyboard",
    "price": 89.5,
    "stock": 45,
    "category": "Electronics"
  }
}
```

curl:

```bash
curl -X POST http://localhost:3000/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"mutation($input: CreateProductInput!){ createProduct(input:$input){ id name price } }","variables":{"input":{"name":"USB-C Hub","price":39.0,"stock":60,"category":"Accessories"}}}'
```

---

## 5. Update a product (partial)

```graphql
mutation {
  updateProduct(id: 1, input: { price: 24.99, stock: 80 }) {
    id
    name
    price
    stock
    updatedAt
  }
}
```

---

## 6. Delete a product

```graphql
mutation {
  deleteProduct(id: 1)
}
```

Expected: `true`

---

## 7. Not found (error case)

```graphql
query {
  product(id: 9999) {
    id
    name
  }
}
```

Expected: GraphQL error `Product with id 9999 not found`.

---

## 8. Validation error (create without required fields)

```graphql
mutation {
  createProduct(input: { price: 10 }) {
    id
    name
  }
}
```

Expected: validation error (name required).

---

## 9. Validation error (negative price)

```graphql
mutation {
  createProduct(input: { name: "Bad", price: -5 }) {
    id
  }
}
```

Expected: validation error (price must be >= 0).

---

## 10. Introspection (schema discovery)

```graphql
query {
  __schema {
    queryType { name }
    mutationType { name }
    types {
      name
      kind
    }
  }
}
```

---

## 11. Query specific fields (GraphQL advantage)

```graphql
query {
  products {
    name
    price
  }
}
```

Only `name` and `price` are returned, reducing payload.

---

## 12. Combined operations in one request

```graphql
query {
  cheap: products {
    id
    name
    price
  }
}
```

(For filtering, extend the schema; demo keeps it simple.)

---

## Notes

- Use Apollo Playground at `http://localhost:3000/graphql` for interactive testing.
