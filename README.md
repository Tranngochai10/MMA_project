# Dealora Voucher

Expo SDK 57, React Native, TypeScript, Expo Router. Giao diện dùng dữ liệu API và vai trò từ tài khoản đã đăng nhập.

## Chạy ứng dụng

```sh
npm install
npx expo start
```

Đặt `EXPO_PUBLIC_API_URL` trong `.env` bằng origin backend, không có `/api`. Web dùng localhost; Android emulator thường dùng `10.0.2.2`; điện thoại dùng IP LAN truy cập được. Khởi động lại Metro sau khi đổi biến môi trường.

```sh
npx tsc --noEmit
npx expo lint
```

## Luồng sử dụng

- USER khám phá voucher, lưu yêu thích, tạo đơn chuyển khoản MB và xem QR theo giá VND từ server. Đơn chờ có thể mở lại trong lịch sử đơn hàng.
- Chi tiết voucher có **Thêm vào giỏ** và **Thanh toán** riêng. Giỏ hàng `/cart` lưu tối đa 50 voucher khác nhau trên thiết bị, tách theo tài khoản; giỏ khách được gộp khi đăng nhập. Giá, hạn và tình trạng được tải lại từ API. Thêm vào giỏ không giữ tồn kho hoặc tạo đơn. Khách xem, xóa và thanh toán từng voucher bằng QR riêng; voucher được bỏ khỏi giỏ khi màn thanh toán nhận trạng thái PAID. Giỏ hàng chưa đồng bộ giữa nhiều thiết bị.
- MANAGER kiểm tra sao kê ngân hàng, nhập mã giao dịch và số tiền thực nhận tại Đơn hàng. Sau xác nhận, voucher được cấp vào ví người dùng.
- USER mở thẻ trong Ví để hiện QR sử dụng. MANAGER mở trang Sử dụng mã, quét QR, kiểm tra thông tin rồi xác nhận đổi một lần.
- MANAGER quản lý toàn bộ thương hiệu và chiến dịch. Voucher lấy thông tin cửa hàng từ brand; brand online dùng link cửa hàng.

Không có role preview, ví tiền mô phỏng, thanh toán thẻ giả hoặc tự xác nhận đã dùng trên phía khách. QR thanh toán và QR sử dụng là hai mã khác nhau. Chuyển khoản MB được đối soát thủ công; chưa dùng VNPAY.

Trang quản lý dùng tiền tố `/manager/` (ví dụ `/manager/vouchers`), tách khỏi URL người dùng `/vouchers/:id`, `/orders`, `/profile`. Mở trực tiếp hoặc tải lại trang voucher vẫn giữ đúng màn hình người dùng. Nút quay lại có đường về dự phòng khi không có lịch sử, và các trang chi tiết có nút Trang chủ.

`expo-camera` dùng quét QR, chỉ xin quyền khi mở camera. Config plugin không yêu cầu microphone. Native cần build ứng dụng lại khi cập nhật module/config; web cần HTTPS hoặc localhost. Có nhập mã voucher thủ công tại quầy khi không dùng được camera.

Giá cũ giữ nguyên số tiền để quản lý chỉnh lại, hiển thị theo VND. Khôi phục mật khẩu chưa có email provider nên API báo chưa cấu hình.

Xem [backend](../../BE/MMA_project/README.md) để cấu hình ngân hàng, MongoDB transaction, upload và giới hạn vận hành.
