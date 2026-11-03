# API Voucher Platform

Response: `{ success: true, message, data }`; lỗi: `{ success: false, message }`. Các ID là ID thật do API trả về. Tiền tệ VND, số nguyên; không tự đổi giá dữ liệu cũ.

## Xác thực

`POST /api/auth/register`, `POST /api/auth/login`: tạo tài khoản và nhận token. Các request bảo vệ dùng `Authorization: Bearer <token>`.

`GET/PUT /api/auth/me`, `POST /api/auth/change-password`, `POST /api/auth/logout` yêu cầu đăng nhập. Đăng xuất/đổi mật khẩu thu hồi phiên cũ. `POST /api/auth/forgot-password` và `/reset-password` trả 503 khi chưa có dịch vụ gửi email; không trả OTP.

MANAGER là quản lý toàn sàn, được kiểm tra quyền bằng role trong DB.

## Thanh toán MB

| API | Quyền | Nội dung |
| --- | --- | --- |
| `POST /api/payments/mb` | Đăng nhập | Body `{ voucherId }`, header `Idempotency-Key` bắt buộc. Tạo đơn PENDING, giữ một suất, không cấp voucher. |
| `GET /api/payments/mb/:id` | Chủ đơn | Xem trạng thái và QR; dùng để kiểm tra thanh toán. |
| `POST /api/payments/mb/:id/confirm` | MANAGER | Body `{ bankTransactionId, receivedAmount }`. Phải kiểm tra sao kê trước. Khớp tiền và mã giao dịch duy nhất thì PAID, cấp voucher trong cùng transaction. |
| `POST /api/payments/mb/:id/cancel` | MANAGER | Hủy PENDING sau khi kiểm tra chưa nhận tiền; trả tồn kho một lần. |

Data trả về: `id`, `orderCode`, `voucherId`, `status`, `amount`, `currency`, `paymentReference`, `bankDetails` (`bankBin`, `accountNumber`, `accountName`), `expiresAt`, `canPay`, `qrImage` (PNG data URI hoặc null), `walletVoucherId` sau xác nhận.

Số tiền lấy từ giá voucher trên server. QR tối đa 30 phút, hết hạn không tự hủy; cần đối soát thủ công. `GET` không xác nhận tiền. API không kết nối sao kê MB và chưa tích hợp VNPAY.

`POST /api/vouchers/:id/buy` là alias tương thích tạo đơn chờ MB, cũng bắt buộc `Idempotency-Key`; không còn cấp voucher hoặc trả PAID tức thì. Client mới dùng `/api/payments/mb`.

503 khi ngân hàng chưa cấu hình hoặc MongoDB không hỗ trợ transaction. 409 khi hết hàng, sai tiền, trùng mã giao dịch hoặc trạng thái không phù hợp.

## Ví và sử dụng QR

| API | Quyền | Nội dung |
| --- | --- | --- |
| `GET /api/user-vouchers` | Đăng nhập | Ví của chính mình; `status=available/used/expired/all`. |
| `GET /api/user-vouchers/:id` | Chủ voucher | Chi tiết thẻ. |
| `GET /api/user-vouchers/:id/qr` | Chủ voucher | `{ qrImage, expiresAt }`; chỉ khi chưa dùng, chưa hết hạn. |
| `POST /api/manager/redemptions/verify` | MANAGER | Body `{ voucherCode }`, nhận chuỗi QR `DLQR:...` hoặc mã nhập tay. Trả trạng thái và quyền lợi đã mua. |
| `POST /api/manager/redemptions/redeem` | MANAGER | Body như verify; xác nhận sử dụng nguyên tử một lần. |
| `GET /api/manager/redemptions` | MANAGER | Lịch sử đổi mã. |

QR sử dụng có chữ ký và audience riêng, tối đa 5 phút. Mã sai/hết hạn trả 400. Voucher đã dùng/hết hạn không được đổi. Các API `PATCH/POST /api/user-vouchers/:id/use` và `POST /api/user-vouchers/use` trả 403.

## Catalog, ảnh và yêu thích

- `GET /api/categories`, `/api/brands`, `/api/brands/:id`.
- `GET /api/vouchers`: `categoryId`, `brandId`, `search`, `sort`, `page`, `limit`, `recommended=true` khi cần gợi ý. `limit` tối đa 100.
- `GET /api/vouchers/:id`: ảnh, giá, quyền lợi và thông tin brand STORE/ONLINE.
- `POST /api/media`: đăng nhập, multipart field `image`, PNG/JPEG/WebP tối đa 5 MB, trả `{ url }`.
- `/api/favorites/brands`, `/api/favorites/vouchers` GET; POST `/:id/toggle` tương ứng để thay đổi yêu thích.

## Đơn hàng và thông báo

- `GET /api/orders`, `/api/orders/:id`: chỉ đơn của tài khoản hiện tại. Chi tiết nhận ObjectId hoặc orderCode.
- `GET /api/notifications`; `PATCH /api/notifications/:id/read`, `/api/notifications/read-all`.

## Quản lý

- `/api/manager/brands`: GET/POST; `/:id` GET/PUT. POST/PUT nhận multipart logo/cover, salesChannel STORE/ONLINE và websiteUrl.
- `/api/manager/vouchers`: GET/POST; `/:id` GET/PUT; `/:id/status` PATCH. Giá bán/giá gốc là số nguyên VND dương; tồn kho và ngày chiến dịch được kiểm tra trên server.
- `GET /api/manager/dashboard`, `/api/manager/orders`: thống kê và danh sách đơn từ DB. Dashboard dùng `redeemedVouchers` cho số voucher đã sử dụng.

Xem [README](../README.md) để cấu hình và giới hạn kiểm thử. Không có seed tài khoản hoặc dữ liệu giao dịch mặc định.
