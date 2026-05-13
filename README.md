# Room Rental Management Software

Ứng dụng web quản lý thuê phòng cho đồ án môn Software Engineering. Dự án gồm backend REST API và frontend React, chạy local để demo nghiệp vụ quản lý phòng, người thuê, hợp đồng, hóa đơn, thanh toán và yêu cầu bảo trì.

## Công nghệ

- Frontend: React 19, React Router, Axios, Vite
- Backend: Node.js, Express.js
- Data layer: local file-backed repository store
- Authentication: JWT
- Authorization: role-based access control với `ADMIN` và `TENANT`
- Architecture: client-server, layered MVC/controller-service-model

## Cấu trúc thư mục

```text
.
├── backend/              # Express API, controllers, services, models, local data store
│   ├── src/
│   ├── .env.example
│   └── package.json
├── frontend/             # React + Vite client
│   ├── src/
│   ├── .env.example
│   └── package.json
├── docs/                 # Tài liệu báo cáo và API
├── .github/              # Template issue/pull request
├── .vscode/              # Task/debug config dùng chung
├── CONTRIBUTING.md       # Quy trình làm việc nhóm
└── README.md
```

## Yêu cầu môi trường

- Node.js 22.x
- npm 10.x
- Git

Nếu dùng `nvm`:

```bash
nvm use
```

## Cài đặt lần đầu

Clone repository:

```bash
git clone <repository-url>
cd room-rental-management-software
```

Cài dependencies cho cả workspace:

```bash
npm install
```

Tạo file môi trường:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## Chạy dự án local

Terminal 1, chạy backend:

```bash
npm run dev:backend
```

Backend chạy tại:

```text
http://127.0.0.1:4000
```

Terminal 2, chạy frontend:

```bash
npm run dev:frontend
```

Frontend chạy tại:

```text
http://127.0.0.1:5173
```

Frontend gọi API qua `/api`; Vite proxy sẽ chuyển request sang backend port `4000`.

## Tài khoản demo

Admin:

```text
Login ID: admin
Password: admin123
```

Tenant:

```text
Login ID: 0900000001
Password: tenant123
```

## Dữ liệu demo

Backend lưu dữ liệu local tại:

```text
backend/data/db.json
```

File này không commit lên GitHub. Backend sẽ tự seed dữ liệu mẫu khi data store trống. Nếu muốn reset dữ liệu demo:

```bash
npm run seed
```

## Cấu hình production

Khi chạy ngoài môi trường demo, cấu hình tối thiểu cần kiểm tra:

- Đặt `NODE_ENV=production`.
- Đặt `JWT_SECRET` bằng chuỗi bí mật mạnh, không dùng giá trị mẫu.
- Đặt `CLIENT_ORIGIN` đúng origin frontend được phép gọi API, ví dụ `https://example.com`.
- Chạy sau proxy HTTPS hoặc hosting có TLS.
- Sao lưu `backend/data/db.json` nếu vẫn dùng local file store.

Backend đã có các lớp bảo vệ cơ bản:

- JWT bắt buộc có secret riêng trong production.
- CORS chỉ cho phép origin trong `CLIENT_ORIGIN` khi được cấu hình.
- Giới hạn JSON request body.
- Security headers cơ bản.
- Service-layer validation cho room, contract, invoice, payment, maintenance.
- Test tự động cho các business rule quan trọng.

## Scripts

Chạy backend dev server:

```bash
npm run dev:backend
```

Chạy frontend dev server:

```bash
npm run dev:frontend
```

Build frontend:

```bash
npm run build
```

Chạy test backend:

```bash
npm test
```

Reset seed data:

```bash
npm run seed
```

## API

Tài liệu endpoint chính nằm tại [docs/API.md](docs/API.md).

Báo cáo kiến trúc, use cases, workflow và diagrams nằm tại [docs/SYSTEM_REPORT.md](docs/SYSTEM_REPORT.md).

Health check:

```bash
curl http://127.0.0.1:4000/api/health
```

Login:

```bash
curl -X POST http://127.0.0.1:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"loginId":"admin","password":"admin123"}'
```

## Quy trình làm việc nhóm

Đọc [CONTRIBUTING.md](CONTRIBUTING.md) trước khi tạo branch hoặc mở pull request.

Quy trình ngắn:

1. Pull code mới nhất từ `main`.
2. Tạo branch theo dạng `feature/ten-tinh-nang` hoặc `fix/mo-ta-loi`.
3. Commit nhỏ, rõ nghĩa.
4. Chạy kiểm tra cần thiết trước khi push.
5. Mở pull request và mô tả thay đổi.

## Checklist trước khi push

```bash
npm install
npm test
npm run build
```

Kiểm tra thủ công:

- Đăng nhập được bằng tài khoản admin.
- Đăng nhập được bằng tài khoản tenant.
- Backend health check trả `200 OK`.
- Không commit `node_modules/`, `.env`, `dist/`, `backend/data/db.json`.
