# Contributing

Tài liệu này quy định cách làm việc chung trong repository để tránh đè code, thiếu cấu hình hoặc push file không cần thiết.

## Quy trình branch

- `main`: branch ổn định, dùng để nộp/demo.
- `feature/<ten-ngan>`: tính năng mới.
- `fix/<ten-ngan>`: sửa lỗi.
- `docs/<ten-ngan>`: tài liệu.

Ví dụ:

```bash
git checkout main
git pull origin main
git checkout -b feature/invoice-filter
```

## Commit

Viết commit ngắn, rõ hành động:

```text
feat: add invoice filter by status
fix: handle empty tenant dashboard
docs: update local setup guide
```

Nên commit theo từng phần nhỏ thay vì gom quá nhiều thay đổi không liên quan.

## Trước khi push

Chạy tối thiểu:

```bash
npm install
npm run build
```

Kiểm tra local:

- Backend chạy được bằng `npm run dev:backend`.
- Frontend chạy được bằng `npm run dev:frontend`.
- Đăng nhập admin được bằng `admin / admin123`.
- Đăng nhập tenant được bằng `0900000001 / tenant123`.

## Pull request

Mỗi pull request nên có:

- Mục đích thay đổi.
- Danh sách file/module chính bị ảnh hưởng.
- Cách test đã thực hiện.
- Ảnh chụp màn hình nếu thay đổi giao diện.

## Quy tắc không commit

Không commit các file/thư mục sau:

- `node_modules/`
- `.env`
- `dist/`
- `backend/data/db.json`
- file log hoặc file tạm của editor

Nếu cần thêm biến môi trường, cập nhật `.env.example` tương ứng.

## Phân chia module

- Backend controller chỉ xử lý request/response.
- Backend service chứa logic nghiệp vụ.
- Model hiện tại dùng local repository store trong `backend/src/data/store.js`.
- Frontend API client nằm ở `frontend/src/api/client.js`.
- Page admin nằm trong `frontend/src/pages/admin/`.
- Page tenant nằm trong `frontend/src/pages/tenant/`.

Khi sửa một nghiệp vụ, ưu tiên giữ đúng ranh giới module để người khác dễ review.
