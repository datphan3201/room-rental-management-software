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

Business rules:

- `roomNumber` không được trùng.
- `floor >= 1`, `maxOccupants >= 1`, `monthlyRent >= 0`.
- `status` chỉ nhận `Available`, `Occupied`, `Maintenance`.
- Không được đổi phòng có hợp đồng active sang `Available` hoặc `Maintenance`.
- Không được xóa phòng đã có dữ liệu hợp đồng, hóa đơn hoặc bảo trì liên quan.

## Tenants

Các endpoint dưới đây cần role `ADMIN`:

```http
GET /tenants
POST /tenants
PUT /tenants/:id
DELETE /tenants/:id
```

Business rules:

- `phone` và `identityNumber` không được trùng.
- Mật khẩu tenant được hash trước khi lưu.
- Không được xóa tenant đã có hợp đồng, hóa đơn, thanh toán hoặc yêu cầu bảo trì liên quan.

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

Business rules:

- Chỉ cho phép trạng thái `Active`, `Expired`, `Terminated`.
- Ngày bắt đầu phải trước ngày kết thúc.
- Chỉ có một hợp đồng `Active` cho mỗi phòng.
- Không thể tạo/activate hợp đồng active cho phòng không `Available`.
- Khi hợp đồng active được tạo, phòng chuyển sang `Occupied`.
- Khi hợp đồng active bị terminate/expire/delete, phòng được trả về `Available` nếu không có active contract khác.

## Invoices

```http
GET /invoices/me
GET /invoices
POST /invoices
PUT /invoices/:id
```

- `/invoices/me`: cần role `TENANT`
- Các endpoint còn lại: cần role `ADMIN`

Business rules:

- `billingMonth` dùng định dạng `YYYY-MM`.
- Chỉ tạo hóa đơn cho hợp đồng `Active`.
- Tenant/room trên hóa đơn phải khớp hợp đồng được chọn.
- Không cho trùng hóa đơn theo tenant và billing month.
- Không được mark `Paid` trực tiếp bằng endpoint invoice; phải dùng payment confirmation.

## Payments

```http
GET /payments/me
GET /payments
POST /payments/confirm
```

- `/payments/me`: cần role `TENANT`
- Các endpoint còn lại: cần role `ADMIN`

Business rules:

- Chỉ xác nhận thanh toán cho invoice chưa `Paid` và không `Cancelled`.
- `tenantId` trong payment phải khớp tenant của invoice.
- `amount` phải khớp `totalAmount` của invoice.
- Sau khi xác nhận, invoice được cập nhật thành `Paid`.

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

Business rules:

- Tenant chỉ được tạo yêu cầu bảo trì cho phòng thuộc hợp đồng active của chính mình.
- Trạng thái hợp lệ: `Pending Review`, `Accepted`, `Rejected`, `Resolved`, `Cancelled`.
- Khi reject yêu cầu bảo trì, admin phải nhập response note.
- Khi resolve yêu cầu, hệ thống tự gán `resolvedAt` nếu chưa có.
