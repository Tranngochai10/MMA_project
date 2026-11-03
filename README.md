# Voucher Platform API

Express, Mongoose, MongoDB. USER quản lý dữ liệu của chính mình; MANAGER quản lý toàn sàn, đối soát chuyển khoản và xác nhận sử dụng voucher.

## Cấu hình và chạy

1. `npm install`.
2. Sao chép `.env.example` thành `.env`, cấu hình MongoDB, `JWT_SECRET`, `PORT`, `PUBLIC_BASE_URL`.
3. Thanh toán cần MongoDB replica set hoặc Atlas có hỗ trợ transaction. Standalone trả 503; không tạo đơn theo cơ chế bù lỗi.
4. Cấu hình `MB_PAYMENT_ENABLED=true`, `MB_ACCOUNT_NUMBER`, `MB_ACCOUNT_NAME` sau khi xác minh tài khoản nhận tiền. Khởi động lại backend sau khi thay `.env`.
5. `npm start`.

MongoDB local trên máy hiện tại đang là standalone. Mở **PowerShell as Administrator** rồi chạy:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\admin\Desktop\mma\BE\MMA_project\scripts\enable-local-replica.ps1"
```

Script chỉ dành cho cấu hình MongoDB 8.2 local đã kiểm tra, giữ bind loopback, dừng dịch vụ để sao lưu lạnh khoảng 366 MB vào `.runtime`, bật `rs0`, cập nhật URI trong `.env`, rồi khởi động MongoDB lại. Sau đó khởi động lại backend. Phiên Codex hiện tại không có quyền Administrator nên chưa thực hiện chuyển đổi. Nếu cấu hình khác, script dừng trước khi sửa. Xem [quy trình MongoDB](https://www.mongodb.com/docs/manual/tutorial/convert-standalone-to-replica-set/).

`GET /api/health` kiểm tra tiến trình. `GET /api/ready` kiểm tra kết nối DB. `PUBLIC_BASE_URL` là origin backend truy cập được từ thiết bị, không có `/api`.

## Chuyển khoản MB

Người dùng tạo đơn PENDING, hệ thống giữ một suất và tạo VietQR tại backend bằng giá VND trong DB. Client không gửi số tiền được thanh toán. Thông tin ngân hàng, giá, quyền lợi và hạn voucher được lưu cùng đơn.

QR có hạn tối đa 30 phút. Mỗi người được giữ tối đa 3 đơn chờ trong kiểm tra tại thời điểm tạo. Header `Idempotency-Key` bắt buộc, 8–128 ký tự chữ/số/`_`/`-`; gửi lại cùng khóa nhận lại đơn cũ.

**Không có kết nối sao kê MB hoặc webhook ngân hàng.** Quản lý phải kiểm tra tiền thực nhận, nội dung và mã giao dịch trên sao kê, rồi xác nhận trong trang Đơn hàng. API yêu cầu số tiền chính xác và mã giao dịch duy nhất. Xác nhận PAID và cấp voucher được thực hiện trong cùng transaction; gửi lại xác nhận cùng mã giao dịch trả lại kết quả cũ.

QR hết hạn không tự hủy đơn vì khách có thể đã chuyển tiền. Quản lý đối soát rồi xác nhận, hoặc hủy khi chắc chắn chưa nhận tiền để trả tồn kho. Voucher hết hạn trước khi xác nhận phải xử lý hoàn tiền ngoài hệ thống. Đơn PAID không được hủy bằng API này.

Giá là số nguyên VND dương. Giá cũ được giữ nguyên; quản lý nhập lại giá cần thiết. Không có chuyển đổi nhân 1.000 tự động.

## QR sử dụng voucher

Chủ sở hữu lấy QR trong Ví. QR được ký HS256, có audience/purpose riêng, hạn tối đa 5 phút và không vượt hạn voucher. Quản lý quét, kiểm tra thông tin rồi xác nhận. Cập nhật nguyên tử kiểm tra chưa dùng/chưa hết hạn và lưu người xác nhận. QR đã dùng không thể sử dụng lần hai. Có nhập mã thủ công tại quầy khi camera không khả dụng.

API tự sử dụng voucher bởi USER luôn trả 403. Vai trò lấy từ tài khoản trên server; không có cổng chuyển vai trò demo.

## Dữ liệu và ảnh

Đã bỏ seed tài khoản/đơn/voucher mẫu, OTP trả trực tiếp và avatar/đánh giá mặc định giả. Không xóa các bản ghi đang có trong DB. Dữ liệu test chỉ tồn tại trong bài kiểm thử cô lập.

Khôi phục mật khẩu trả 503 cho đến khi tích hợp dịch vụ gửi email thật. Đăng nhập, đổi mật khẩu và thu hồi phiên vẫn hoạt động.

Ảnh được upload bằng `POST /api/media` với Bearer token, field `image`; brand hỗ trợ multipart logo/cover. File PNG/JPEG/WebP tối đa 5 MB, lưu `public/uploads`. Brand STORE tìm bản đồ theo tên; ONLINE lưu website. Voucher kế thừa hình thức cửa hàng của brand.

## Kiểm thử

`npm test` chạy test cô lập không kết nối DB thật: payload VietQR/CRC, tạo đơn chờ, chống tạo trùng, xác nhận đúng tiền, cấp một lần, hủy trả kho, quyền sở hữu, QR hết hạn/sai chữ ký, đổi mã đồng thời, upload và snapshot.

Test transaction dùng mock và chưa thay thế kiểm thử trên replica set thật. Chưa thực hiện chuyển tiền thật hoặc kiểm tra camera trên điện thoại. Camera cần HTTPS hoặc localhost trên web; ứng dụng native cần build lại khi thay config plugin.

Rate limit lưu trong bộ nhớ một tiến trình. Triển khai nhiều instance cần kho giới hạn dùng chung. VNPAY và hoàn tiền tự động chưa được tích hợp.

Xem [API](docs/API_DOCUMENTATION.md).
