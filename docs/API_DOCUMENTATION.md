# 📖 TÀI LIỆU HƯỚNG DẪN TÍCH HỢP HỆ THỐNG RESTful API
> **Dự án**: Sàn Giao Dịch & Săn Voucher Ưu Đãi Thương Hiệu (`Voucher Platform`)  
> **Backend Base URL**: `http://localhost:5000` (hoặc IP mạng nội bộ của máy chủ backend khi test qua Expo mobile: `http://<IP_MAY_TINH>:5000`)  
> **Định dạng dữ liệu**: `JSON` (`Content-Type: application/json`)  
> **Cơ chế xác thực**: `JWT Bearer Token` (`Authorization: Bearer <token>`)

---

## 📌 MỤC LỤC
1. [Quy chuẩn Response & Mã lỗi](#1-quy-chuẩn-response--mã-lỗi)
2. [Module 1: Xác Thực Tài Khoản (Authentication)](#2-module-1-xác-thực-tài-khoản-authentication)
3. [Module 2: Danh Mục Ngành Hàng (Categories)](#3-module-2-danh-mục-ngành-hàng-categories)
4. [Module 3: Thương Hiệu Đối Tác (Brands)](#4-module-3-thương-hiệu-đối-tác-brands)
5. [Module 4: Khám Phá & Săn Voucher (Vouchers)](#5-module-4-khám-phá--săn-voucher-vouchers)
6. [Module 5: Mục Yêu Thích (Favorites)](#6-module-5-mục-yêu-thích-favorites)
7. [Module 6: Kho Ví Voucher Của Người Dùng (User Vouchers)](#7-module-6-kho-ví-voucher-của-người-dùng-user-vouchers)
8. [Kiểm Tra Trạng Thái Server (Health Check)](#8-kiểm-tra-trạng-thái-server-health-check)

---

## 1. QUY CHUẨN RESPONSE & MÃ LỖI

### 1.1. Cấu trúc Response thành công
```json
{
  "success": true,
  "message": "Mô tả kết quả thao tác",
  "data": { ... } // hoặc [ ... ]
}
```

### 1.2. Cấu trúc Response thất bại (Error)
```json
{
  "success": false,
  "message": "Thông báo lỗi chi tiết cho client",
  "details": [ ... ] // (Tùy chọn) danh sách chi tiết các trường bị lỗi validate
}
```

### 1.3. Bảng mã HTTP Status Code thông dụng
* `200 OK`: Truy vấn, cập nhật hoặc thao tác thành công.
* `201 Created`: Tạo tài nguyên mới thành công (Đăng ký, Mua voucher).
* `400 Bad Request`: Thiếu dữ liệu, dữ liệu gửi lên sai định dạng, voucher hết lượt, voucher hết hạn.
* `401 Unauthorized`: Chưa đăng nhập hoặc token JWT bị thiếu / sai / hết hạn.
* `403 Forbidden`: Tài khoản không có quyền truy cập hoặc không phải chủ sở hữu voucher.
* `404 Not Found`: Không tìm thấy ID tài nguyên được yêu cầu.
* `409 Conflict`: Dữ liệu bị trùng lặp (Email đã đăng ký, Mã thương hiệu đã tồn tại).
* `500 Internal Server Error`: Lỗi máy chủ xử lý.

---

## 2. MODULE 1: XÁC THỰC TÀI KHOẢN (AUTHENTICATION)
Tiền tố route: `/api/auth`

---

### 2.1. Đăng ký tài khoản (Register)
* **URL**: `/api/auth/register`
* **Method**: `POST`
* **Xác thực**: Không (Public)
* **Mô tả**: Đăng ký tài khoản mới. Mặc định mọi tài khoản tạo qua API này đều có quyền `role: "USER"`.
* **Request Body**:

| Trường | Kiểu dữ liệu | Bắt buộc | Ghi chú |
| :--- | :--- | :---: | :--- |
| `full_name` | `string` | **Có** | Họ và tên người dùng (VD: `"Nguyen Van A"`) |
| `email` | `string` | **Có** | Định dạng email hợp lệ, duy nhất |
| `password` | `string` | **Có** | Mật khẩu tối thiểu 6 ký tự |
| `phone` | `string` | Không | Số điện thoại liên hệ (VD: `"0912345678"`) |

* **Request Body Mẫu**:
```json
{
  "full_name": "Nguyen Van A",
  "email": "user.alex@example.com",
  "password": "Voucher2026!",
  "phone": "0912345678"
}
```

* **Response Mẫu (201 Created)**:
```json
{
  "success": true,
  "message": "Đăng ký tài khoản thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": "7d",
    "user": {
      "_id": "6ae1ea3a108d04ab44710862",
      "full_name": "Nguyen Van A",
      "email": "user.alex@example.com",
      "phone": "0912345678",
      "role": "USER",
      "avatar_url": "https://images.unsplash.com/...",
      "status": "active",
      "created_at": "2026-10-28T12:00:00.000Z"
    }
  }
}
```

---

### 2.2. Đăng nhập (Login)
* **URL**: `/api/auth/login`
* **Method**: `POST`
* **Xác thực**: Không (Public)
* **Request Body**:

| Trường | Kiểu dữ liệu | Bắt buộc | Ghi chú |
| :--- | :--- | :---: | :--- |
| `email` | `string` | **Có** | Email tài khoản |
| `password` | `string` | **Có** | Mật khẩu tài khoản |

* **Request Body Mẫu**:
```json
{
  "email": "user.alex@example.com",
  "password": "Voucher2026!"
}
```

* **Response Mẫu (200 OK)**:
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": "7d",
    "user": {
      "_id": "6ae1ea3a108d04ab44710862",
      "full_name": "Nguyen Van A",
      "email": "user.alex@example.com",
      "phone": "0912345678",
      "role": "USER",
      "avatar_url": "https://images.unsplash.com/...",
      "status": "active"
    }
  }
}
```

---

### 2.3. Lấy thông tin cá nhân hiện tại (Get Current User)
* **URL**: `/api/auth/me`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Xác thực**: Bắt buộc (Token hợp lệ)
* **Response Mẫu (200 OK)**:
```json
{
  "success": true,
  "message": "Lấy thông tin người dùng thành công",
  "data": {
    "user": {
      "_id": "6ae1ea3a108d04ab44710862",
      "full_name": "Nguyen Van A",
      "email": "user.alex@example.com",
      "phone": "0912345678",
      "role": "USER",
      "avatar_url": "https://images.unsplash.com/...",
      "status": "active"
    }
  }
}
```

---

### 2.4. Đổi mật khẩu (Change Password)
* **URL**: `/api/auth/change-password`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Request Body**:

| Trường | Kiểu dữ liệu | Bắt buộc | Ghi chú |
| :--- | :--- | :---: | :--- |
| `current_password` | `string` | **Có** | Mật khẩu đang sử dụng |
| `new_password` | `string` | **Có** | Mật khẩu mới (tối thiểu 6 ký tự) |

---

### 2.5. Đăng xuất (Logout)
* **URL**: `/api/auth/logout`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Response Mẫu (200 OK)**:
```json
{
  "success": true,
  "message": "Đăng xuất thành công",
  "data": {
    "logged_out": true
  }
}
```

---

## 3. MODULE 2: DANH MỤC NGÀNH HÀNG (CATEGORIES)
Tiền tố route: `/api/categories`

---

### 3.1. Lấy danh sách danh mục (Filter Chips)
* **URL**: `/api/categories`
* **Method**: `GET`
* **Xác thực**: Không (Public)
* **Mô tả**: Cung cấp danh mục cho dải thanh cuộn ngang Filter Chip trên màn hình Khám phá.
* **Response Mẫu (200 OK)**:
```json
{
  "success": true,
  "message": "Lấy danh sách danh mục thành công",
  "data": [
    {
      "_id": "6ae1e9e25a9238c9dd0699f6",
      "name": "Cà phê & Trà",
      "slug": "coffee-tea",
      "icon": "cafe-outline",
      "order": 1
    },
    {
      "_id": "6ae1e9e25a9238c9dd0699f7",
      "name": "Ẩm thực & Nhà hàng",
      "slug": "food-dining",
      "icon": "restaurant-outline",
      "order": 2
    }
  ]
}
```

---

## 4. MODULE 3: THƯƠNG HIỆU ĐỐI TÁC (BRANDS)
Tiền tố route: `/api/brands`

---

### 4.1. Danh sách thương hiệu nổi bật
* **URL**: `/api/brands`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <TOKEN>` *(Tùy chọn: Gửi kèm token để biết user đã tim thương hiệu đó chưa)*
* **Xác thực**: Không bắt buộc
* **Mô tả**: Phục vụ mục "Thương hiệu nổi bật" trên Trang Chủ và màn hình Danh sách Thương hiệu. Đã tích hợp đếm sẵn số voucher khả dụng `activeVouchersCount`.
* **Response Mẫu (200 OK)**:
```json
{
  "success": true,
  "message": "Lấy danh sách thương hiệu nổi bật thành công",
  "data": [
    {
      "_id": "6ae1e9e25a9238c9dd0699fe",
      "name": "Starbucks Coffee",
      "code": "SB",
      "rating": 4.9,
      "logo_url": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&auto=format&fit=crop&q=80",
      "cover_image_url": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80",
      "description": "Thương hiệu cà phê đặc sản hàng đầu thế giới, đồ uống pha chế thủ công.",
      "categoryName": "Cà phê & Trà",
      "categoryId": "6ae1e9e25a9238c9dd0699f6",
      "activeVouchersCount": 2,
      "isFavorite": false
    }
  ]
}
```

---

### 4.2. Chi tiết 1 thương hiệu
* **URL**: `/api/brands/:id`
* **Method**: `GET`
* **Params**: `:id` - ObjectId của thương hiệu

---

### 4.3. Tạo thương hiệu mới (Dành cho Quản lý)
* **URL**: `/api/brands`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <MANAGER_TOKEN>`
* **Quyền hạn**: `MANAGER`
* **Request Body**:

| Trường | Kiểu dữ liệu | Bắt buộc | Ghi chú |
| :--- | :--- | :---: | :--- |
| `name` | `string` | **Có** | Tên thương hiệu |
| `code` | `string` | **Có** | Mã 2 chữ cái viết hoa duy nhất (VD: `"PL"`, `"HL"`) |
| `categoryId` | `string` | Không | ObjectId của danh mục ngành hàng |
| `rating` | `number` | Không | Đánh giá sao (1.0 - 5.0, mặc định: 4.8) |
| `logo_url` | `string` | Không | URL ảnh logo tròn |
| `cover_image_url` | `string` | Không | URL ảnh banner thương hiệu |
| `description` | `string` | Không | Giới thiệu về thương hiệu |

---

## 5. MODULE 4: KHÁM PHÁ & SĂN VOUCHER (VOUCHERS)
Tiền tố route: `/api/vouchers`

---

### 5.1. Danh sách Voucher & Gợi ý Thông minh
* **URL**: `/api/vouchers`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <TOKEN>` *(Khuyến khích gửi kèm để kích hoạt tính năng "Dành riêng cho bạn")*
* **Xác thực**: Không bắt buộc
* **Query Parameters**:

| Param | Kiểu | Mặc định | Ý nghĩa & Giá trị |
| :--- | :--- | :---: | :--- |
| `categoryId` | `string` | - | Lọc theo ObjectId danh mục |
| `brandId` | `string` | - | Lọc theo ObjectId thương hiệu |
| `search` | `string` | - | Tìm kiếm từ khóa theo tiêu đề voucher |
| `sort` | `string` | `discount_desc` | `newest`: Mới ra mắt<br/>`discount_desc`: Ưu đãi hot (Giảm giá cao nhất)<br/>`price_asc`: Giá thấp đến cao<br/>`price_desc`: Giá cao đến thấp |
| `page` | `number` | `1` | Số trang |
| `limit` | `number` | `20` | Số lượng voucher / trang |

> **🌟 Logic Gợi ý "Dành Riêng Cho Bạn"**:  
> Nếu client **gửi kèm Token người dùng** và **không truyền bộ lọc tìm kiếm**, hệ thống sẽ tự động quét ví voucher của user để nhận diện danh mục ưu thích nhất và ưu tiên đẩy các voucher tương tự lên đầu danh sách (kèm cờ `"isPersonalized": true`).

* **Response Mẫu (200 OK)**:
```json
{
  "success": true,
  "message": "Lấy danh sách voucher thành công",
  "data": {
    "vouchers": [
      {
        "_id": "6ae1e9e25a9238c9dd069a04",
        "title": "Giảm 50% Toàn Bộ Menu Đồ Uống Mùa Thu",
        "brand": {
          "_id": "6ae1e9e25a9238c9dd0699fe",
          "name": "Starbucks Coffee",
          "code": "SB",
          "logo_url": "https://images.unsplash.com/...",
          "rating": 4.9
        },
        "category": "Cà phê & Trà",
        "categoryId": "6ae1e9e25a9238c9dd0699f6",
        "discountType": "PERCENTAGE",
        "discountValue": 50,
        "discountPercent": 50,
        "discountDisplay": "50% OFF",
        "sellingPrice": 45000,
        "originalValue": 90000,
        "expirationDate": "2027-06-30T23:59:59.000Z",
        "availableQuantity": 94,
        "thumbnail_url": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&fit=crop&q=80",
        "isFavorite": false
      }
    ],
    "total": 7,
    "page": 1,
    "limit": 20,
    "isPersonalized": true
  }
}
```

---

### 5.2. Xem Chi tiết 1 Voucher
* **URL**: `/api/vouchers/:id`
* **Method**: `GET`
* **Params**: `:id` - ObjectId của voucher
* **Response Mẫu (200 OK)**:
```json
{
  "success": true,
  "message": "Lấy chi tiết voucher thành công",
  "data": {
    "_id": "6ae1e9e25a9238c9dd069a04",
    "title": "Giảm 50% Toàn Bộ Menu Đồ Uống Mùa Thu",
    "description": "Áp dụng cho mọi cỡ ly Frappuccino, Cà phê pha máy và Trà Teavana đặc biệt.",
    "brand": {
      "_id": "6ae1e9e25a9238c9dd0699fe",
      "name": "Starbucks Coffee",
      "code": "SB",
      "logo_url": "https://images.unsplash.com/...",
      "cover_image_url": "https://images.unsplash.com/...",
      "rating": 4.9
    },
    "category": "Cà phê & Trà",
    "discountType": "PERCENTAGE",
    "discountValue": 50,
    "discountDisplay": "50% OFF",
    "sellingPrice": 45000,
    "originalValue": 90000,
    "totalQuantity": 100,
    "availableQuantity": 94,
    "startDate": "2026-10-28T12:00:00.000Z",
    "expirationDate": "2027-06-30T23:59:59.000Z",
    "termsAndConditions": [
      "Áp dụng tại tất cả các cửa hàng Starbucks Việt Nam.",
      "Mỗi voucher có giá trị sử dụng 01 lần duy nhất.",
      "Không quy đổi thành tiền mặt hoặc hoàn lại tiền thừa."
    ],
    "coverImage": "https://images.unsplash.com/...",
    "thumbnail_url": "https://images.unsplash.com/...",
    "isFavorite": false
  }
}
```

---

### 5.3. Mua Voucher (Giao dịch Mua & Nhận mã)
* **URL**: `/api/vouchers/:id/buy`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Xác thực**: Bắt buộc (User đang đăng nhập)
* **Mô tả nghiệp vụ**:
  * Trừ số lượng khả dụng `availableQuantity` theo cơ chế Atomic an toàn.
  * Tự động sinh mã voucher độc nhất: **2 chữ cái Brand + 6 số ngẫu nhiên** (VD: `SB764270`).
  * Sinh mã đơn hàng `orderCode` (VD: `ORD-71500`).
  * Tự động nạp vào kho ví người dùng `UserVoucher` với trạng thái `is_used = false`.
* **Request Body** *(Tùy chọn)*:
```json
{
  "paymentMethod": "Credit Card" // hoặc "MoMo", "ZaloPay", "E-Wallet"
}
```
* **Response Mẫu (Khớp màn hình Thanh toán thành công)**:
```json
{
  "success": true,
  "message": "Thanh toán và nhận voucher thành công",
  "data": {
    "orderCode": "ORD-71500",
    "voucherCode": "SB764270",
    "voucherTitle": "Giảm 50% Toàn Bộ Menu Đồ Uống Mùa Thu",
    "brandName": "Starbucks Coffee",
    "brandLogo": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&auto=format&fit=crop&q=80",
    "totalAmount": 45000,
    "paymentMethod": "Credit Card",
    "purchasedDate": "2026-10-28T12:30:08.350Z",
    "expirationDate": "2027-06-30T23:59:59.000Z"
  }
}
```

---

## 6. MODULE 5: MỤC YÊU THÍCH (FAVORITES)
Tiền tố route: `/api/favorites`  
*(Tất cả API trong module này đều bắt buộc kèm `Authorization: Bearer <TOKEN>`)*

---

### 6.1. Bấm tim / Bỏ tim Thương hiệu (Toggle Brand Favorite)
* **URL**: `/api/favorites/brands/:id/toggle`
* **Method**: `POST`
* **Params**: `:id` - ObjectId của Brand
* **Response Mẫu**:
```json
{
  "success": true,
  "message": "Đã thêm thương hiệu vào mục yêu thích",
  "data": {
    "brandId": "6ae1e9e25a9238c9dd0699fe",
    "isFavorite": true,
    "message": "Đã thêm thương hiệu vào mục yêu thích"
  }
}
```

---

### 6.2. Lấy danh sách Thương hiệu đã yêu thích
* **URL**: `/api/favorites/brands`
* **Method**: `GET`
* **Mô tả**: Trả về các thương hiệu user đã tim, kèm trường `activeVouchersCount` và `isFavorite: true`.

---

### 6.3. Bấm tim / Bỏ tim Voucher (Toggle Voucher Favorite)
* **URL**: `/api/favorites/vouchers/:id/toggle`
* **Method**: `POST`
* **Params**: `:id` - ObjectId của Voucher
* **Response Mẫu**:
```json
{
  "success": true,
  "message": "Đã thêm voucher vào mục yêu thích",
  "data": {
    "voucherId": "6ae1e9e25a9238c9dd069a04",
    "isFavorite": true,
    "message": "Đã thêm voucher vào mục yêu thích"
  }
}
```

---

### 6.4. Lấy danh sách Voucher đã yêu thích
* **URL**: `/api/favorites/vouchers`
* **Method**: `GET`
* **Mô tả**: Trả về danh sách voucher user đã tim.

---

## 7. MODULE 6: KHO VÍ VOUCHER CỦA NGƯỜI DÙNG (USER VOUCHERS)
Tiền tố route: `/api/user-vouchers`  
*(Tất cả API trong module này đều bắt buộc kèm `Authorization: Bearer <TOKEN>`)*

---

### 7.1. Lấy danh sách voucher trong ví (User Wallet)
* **URL**: `/api/user-vouchers`
* **Method**: `GET`
* **Query Parameters**:

| Param | Kiểu | Mặc định | Giá trị chấp nhận |
| :--- | :--- | :---: | :--- |
| `status` | `string` | `available` | `available`: Khả dụng (chưa dùng & còn hạn)<br/>`used`: Đã sử dụng (`is_used = true`)<br/>`expired`: Hết hạn (`is_used = false` & quá hạn)<br/>`all`: Toàn bộ lịch sử |

* **Response Mẫu (Khớp định dạng thẻ WalletVoucherCard)**:
```json
{
  "success": true,
  "message": "Lấy danh sách ví voucher thành công",
  "data": [
    {
      "_id": "6ae1ead0fa54ca8d46ed18a4",
      "voucherId": "6ae1e9e25a9238c9dd069a04",
      "voucherCode": "SB764270",
      "orderCode": "ORD-71500",
      "title": "Giảm 50% Toàn Bộ Menu Đồ Uống Mùa Thu",
      "brandName": "Starbucks Coffee",
      "brandLogo": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&auto=format&fit=crop&q=80",
      "discountDisplay": "50% OFF",
      "sellingPrice": 45000,
      "originalValue": 90000,
      "coverImage": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80",
      "status": "AVAILABLE",
      "statusText": "Khả dụng",
      "isUsed": false,
      "usedAt": null,
      "expirationDate": "2027-06-30T23:59:59.000Z",
      "purchasedDate": "2026-10-28T12:30:08.350Z"
    }
  ]
}
```

---

### 7.2. Sử dụng Voucher (Use Voucher)
* **URL**: `/api/user-vouchers/:id/use` *(Hỗ trợ cả method `PATCH` và `POST`)*
* **Method**: `PATCH` hoặc `POST`
* **Params**: `:id` - Có thể truyền **`_id` của UserVoucher** hoặc **Mã voucher `voucherCode`** (VD: `SB764270`)
* **Mô tả nghiệp vụ**:
  * Kiểm tra đúng User sở hữu voucher (nếu không phải $\rightarrow$ `403 Forbidden`).
  * Kiểm tra nếu đã dùng trước đó $\rightarrow$ `400 Bad Request: "Voucher này đã được sử dụng trước đó"`.
  * Kiểm tra nếu đã quá hạn $\rightarrow$ `400 Bad Request: "Voucher đã hết hạn sử dụng"`.
  * Đổi cờ `is_used = true` và ghi nhận thời gian `used_at = new Date()`.
* **Response Mẫu (200 OK)**:
```json
{
  "success": true,
  "message": "Sử dụng voucher thành công",
  "data": {
    "_id": "6ae1ead0fa54ca8d46ed18a4",
    "voucherId": "6ae1e9e25a9238c9dd069a04",
    "voucherCode": "SB764270",
    "orderCode": "ORD-71500",
    "title": "Giảm 50% Toàn Bộ Menu Đồ Uống Mùa Thu",
    "brandName": "Starbucks Coffee",
    "brandLogo": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&auto=format&fit=crop&q=80",
    "discountDisplay": "50% OFF",
    "status": "USED",
    "statusText": "Đã dùng",
    "isUsed": true,
    "usedAt": "2026-10-28T12:38:26.387Z",
    "expirationDate": "2027-06-30T23:59:59.000Z",
    "purchasedDate": "2026-10-28T12:30:08.350Z"
  }
}
```

---

## 8. KIỂM TRA TRẠNG THÁI SERVER (HEALTH CHECK)
* **URL**: `/api/health`
* **Method**: `GET`
* **Xác thực**: Không (Public)
* **Response**:
```json
{
  "status": "ok",
  "service": "voucher-platform backend",
  "timestamp": "2026-10-28T12:30:00.000Z"
}
```

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY SERVER VÀ NẠP SEED DATA

```bash
# 1. Chuyển vào thư mục backend
cd voucher-platform

# 2. Cài đặt dependencies (nếu chưa cài)
npm install

# 3. Nạp dữ liệu danh mục, thương hiệu và voucher mẫu bám sát UI
npm run seed

# 4. Khởi động server
npm run dev
# Server sẽ lắng nghe tại cổng http://localhost:5000
```
