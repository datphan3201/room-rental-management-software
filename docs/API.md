# API Reference

Base URL khi gọi trực tiếp backend:

```text
http://127.0.0.1:4000/api
```

Khi chạy frontend Vite, client gọi:

```text
/api
```

Vite proxy chuyển request sang backend port `4000`.

## Authentication

Login:

```http
POST /auth/login
```

Body:

```json
{
  "loginId": "admin",
  "password": "admin123"
}
```

Response trả về `token` và `user`. Các endpoint cần đăng nhập dùng header:

```http
Authorization: Bearer <token>
```

Current user:

```http
GET /auth/me
```

## Health

```http
GET /health
```

Không cần đăng nhập.

## Dashboard

```http
GET /dashboard/admin
GET /dashboard/tenant
```

- `/dashboard/admin`: cần role `ADMIN`
- `/dashboard/tenant`: cần role `TENANT`

## Rooms

Các endpoint dưới đây cần role `ADMIN`:

```http
GET /rooms
POST /rooms
PUT /rooms/:id
DELETE /rooms/:id
```

## Tenants

Các endpoint dưới đây cần role `ADMIN`:

```http
GET /tenants
POST /tenants
PUT /tenants/:id
DELETE /tenants/:id
```

## Contracts

```http
GET /contracts/me
GET /contracts
POST /contracts
PUT /contracts/:id
DELETE /contracts/:id
```

- `/contracts/me`: cần role `TENANT`
- Các endpoint còn lại: cần role `ADMIN`

## Invoices

```http
GET /invoices/me
GET /invoices
POST /invoices
PUT /invoices/:id
```

- `/invoices/me`: cần role `TENANT`
- Các endpoint còn lại: cần role `ADMIN`

## Payments

```http
GET /payments/me
GET /payments
POST /payments/confirm
```

- `/payments/me`: cần role `TENANT`
- Các endpoint còn lại: cần role `ADMIN`

## Maintenance

```http
GET /maintenance/me
GET /maintenance
POST /maintenance
PUT /maintenance/:id
```

- `/maintenance/me`: cần role `TENANT`
- `GET /maintenance`: cần role `ADMIN`
- `POST /maintenance`: cần role `TENANT` hoặc `ADMIN`
- `PUT /maintenance/:id`: cần role `ADMIN`
