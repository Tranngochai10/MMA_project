# 📖 TÀI LIỆU HƯỚNG DẪN TÍCH HỢP HỆ THỐNG RESTful API
> **Dự án**: Sàn Giao Dịch & Săn Voucher Ưu Đãi Thương Hiệu (`Voucher Platform`)  
> **Backend Base URL**: `http://localhost:5000` (hoặc IP máy tính phát wifi khi test qua Expo mobile: `http://<IP_MAY_TINH>:5000`)  
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
8. [Module 7: Lịch Sử Đơn Hàng (Orders)](#8-module-7-lịch-sử-đơn-hàng-orders)
9. [Module 8: Hệ Thống Thông Báo (Notifications)](#9-module-8-hệ-thống-thông-báo-notifications)
10. [Module 9: Cổng Quản Lý Đối Tác & Toàn Sàn (Manager Portal)](#10-module-9-cổng-quản-lý-đối-tác--toàn-sàn-manager-portal)
11. [Kiểm Tra Trạng Thái Server (Health Check)](#11-kiểm-tra-trạng-thái-server-health-check)
12. [Bộ Lệnh cURL Kiểm Thử Mẫu (Quick cURL Cheat Sheet)](#12-bộ-lệnh-curl-kiểm-thử-mẫu-quick-curl-cheat-sheet)

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
  "details": [ ... ]
}
```

### 1.3. Bảng mã HTTP Status Code thông dụng
* `200 OK`: Truy vấn, cập nhật hoặc thao tác thành công.
* `201 Created`: Tạo tài nguyên mới thành công.
* `400 Bad Request`: Dữ liệu không hợp lệ, thiếu trường bắt buộc, voucher đã hết hạn hoặc đã sử dụng.
* `401 Unauthorized`: Chưa đăng nhập hoặc token không hợp lệ / hết hạn.
* `403 Forbidden`: Không có quyền truy cập (cần Role `MANAGER`) hoặc không sở hữu tài nguyên.
* `404 Not Found`: Không tìm thấy tài nguyên yêu cầu.
* `409 Conflict`: Dữ liệu bị trùng lặp (email đã đăng ký, mã code thương hiệu đã tồn tại).
* `500 Internal Server Error`: Lỗi máy chủ.

---

## 2. MODULE 1: XÁC THỰC TÀI KHOẢN (AUTHENTICATION)
Tiền tố route: `/api/auth`

### 2.1. Đăng ký tài khoản (Register)
* **URL**: `/api/auth/register` | **Method**: `POST` | **Auth**: Không
* **Mô tả**: Đăng ký tài khoản mới. Mặc định luôn có `role: "USER"`.
* **Request Body**:
```json
{
  "full_name": "Alex Rivera",
  "email": "user.alex@example.com",
  "password": "Voucher2026!",
  "phone": "0912 345 678"
}
```
* **Response Mẫu (201 Created)**:
```json
{
  "success": true,
  "message": "Đăng ký tài khoản thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": "7d"
  }
}
```

### 2.2. Đăng nhập (Login)
* **URL**: `/api/auth/login` | **Method**: `POST` | **Auth**: Không
* **Request Body**:
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
    "expires_in": "7d"
  }
}
```

### 2.3. Lấy thông tin cá nhân hiện tại (Get Profile)
* **URL**: `/api/auth/me` | **Method**: `GET` | **Auth**: `Bearer Token`
* **Response Mẫu (200 OK)**:
```json
{
  "success": true,
  "message": "Lấy thông tin người dùng thành công",
  "data": {
    "user": {
      "_id": "6ae621e8beaaf41707e02c35",
      "full_name": "Alex Rivera",
      "email": "user.alex@example.com",
      "phone": "0912 345 678",
      "role": "USER",
      "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      "status": "active"
    }
  }
}
```

### 2.4. Cập nhật hồ sơ cá nhân (Update Profile)
* **URL**: `/api/auth/me` | **Method**: `PUT` (hoặc `PATCH`) | **Auth**: `Bearer Token`
* **Màn hình Frontend**: `/(user)/edit-profile.tsx`
* **Request Body**:
```json
{
  "full_name": "Alex Rivera Updated",
  "phone": "0988 888 999",
  "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
}
```
* **Response Mẫu (200 OK)**:
```json
{
  "success": true,
  "message": "Cập nhật thông tin cá nhân thành công",
  "data": {
    "user": {
      "_id": "6ae621e8beaaf41707e02c35",
      "full_name": "Alex Rivera Updated",
      "email": "user.alex@example.com",
      "phone": "0988 888 999",
      "role": "USER",
      "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
    }
  }
}
```

### 2.5. Đổi mật khẩu (Change Password)
* **URL**: `/api/auth/change-password` | **Method**: `POST` | **Auth**: `Bearer Token`
* **Request Body**: `{ "current_password": "...", "new_password": "..." }`

### 2.6. Đăng xuất (Logout)
* **URL**: `/api/auth/logout` | **Method**: `POST` | **Auth**: `Bearer Token`

---

## 3. MODULE 2: DANH MỤC NGÀNH HÀNG (CATEGORIES)
Tiền tố route: `/api/categories`

### 3.1. Lấy danh sách danh mục
* **URL**: `/api/categories` | **Method**: `GET` | **Auth**: Không
* **Response Mẫu (200 OK)**:
```json
{
  "success": true,
  "message": "Lấy danh sách danh mục thành công",
  "data": [
    {
      "_id": "6ae621e8beaaf41707e02c1f",
      "name": "Cà phê & Trà",
      "slug": "coffee-tea",
      "icon": "cafe-outline",
      "order": 1
    }
  ]
}
```

---

## 4. MODULE 3: THƯƠNG HIỆU ĐỐI TÁC (BRANDS)
Tiền tố route: `/api/brands`

### 4.1. Lấy danh sách thương hiệu nổi bật
* **URL**: `/api/brands` | **Method**: `GET` | **Auth**: Không bắt buộc (Kèm token để nhận diện `isFavorite`)
* **Response Mẫu (200 OK)**:
```json
{
  "success": true,
  "message": "Lấy danh sách thương hiệu nổi bật thành công",
  "data": [
    {
      "_id": "6ae621e8beaaf41707e02c29",
      "name": "Starbucks Coffee",
      "code": "SB",
      "rating": 4.9,
      "logo_url": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&auto=format&fit=crop&q=80",
      "cover_image_url": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80",
      "categoryName": "Cà phê & Trà",
      "activeVouchersCount": 2,
      "isFavorite": false
    }
  ]
}
```

### 4.2. Chi tiết 1 thương hiệu
* **URL**: `/api/brands/:id` | **Method**: `GET` | **Auth**: Không bắt buộc

---

## 5. MODULE 4: KHÁM PHÁ & SĂN VOUCHER (VOUCHERS)
Tiền tố route: `/api/vouchers`

### 5.1. Danh sách Voucher & Gợi ý Thông minh
* **URL**: `/api/vouchers` | **Method**: `GET` | **Auth**: Không bắt buộc
* **Query Params**: `categoryId`, `brandId`, `search`, `sort` (`newest`, `discount_desc`, `price_asc`, `price_desc`), `page`, `limit`.

### 5.2. Xem Chi tiết 1 Voucher
* **URL**: `/api/vouchers/:id` | **Method**: `GET` | **Auth**: Không bắt buộc

### 5.3. Mua Voucher (Giao dịch Mua & Nhận mã Atomic)
* **URL**: `/api/vouchers/:id/buy` | **Method**: `POST` | **Auth**: `Bearer Token`
* **Mô tả nghiệp vụ**:
  * Trừ số lượng tồn kho `availableQuantity` theo cơ chế Atomic an toàn.
  * Tự động sinh `Order` mới (mã `ORD-xxxxx`).
  * Sinh mã voucher duy nhất chuẩn **2 chữ cái Brand + 6 số** (VD: `SB184920`).
  * Tự động lưu vào kho ví `UserVoucher` (liên kết với `orderId`).
  * Tự động phát thông báo `PURCHASE_SUCCESS` cho User.
  * Bọc toàn bộ trong MongoDB Session Transaction rollback an toàn nếu phát sinh sự cố.
* **Request Body**:
```json
{
  "paymentMethod": "MoMo E-Wallet"
}
```
* **Response Mẫu (200 OK)**:
```json
{
  "success": true,
  "message": "Thanh toán và nhận voucher thành công",
  "data": {
    "orderId": "6ae6223daec3d3da1375b12c",
    "orderCode": "ORD-78107",
    "walletVoucherId": "6ae6223daec3d3da1375b12d",
    "voucherCode": "SB184920",
    "voucherTitle": "Giảm 50% Toàn Bộ Menu Đồ Uống Mùa Thu",
    "brandName": "Starbucks Coffee",
    "brandLogo": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&auto=format&fit=crop&q=80",
    "totalAmount": 45000,
    "paymentMethod": "MoMo E-Wallet",
    "purchasedDate": "2026-11-01T00:15:00.000Z",
    "expirationDate": "2027-06-30T23:59:59.000Z"
  }
}
```

---

## 6. MODULE 5: MỤC YÊU THÍCH (FAVORITES)
Tiền tố route: `/api/favorites` | **Auth**: `Bearer Token`

* `GET /api/favorites/brands`: Danh sách thương hiệu đã tim.
* `POST /api/favorites/brands/:id/toggle`: Tim / Bỏ tim thương hiệu.
* `GET /api/favorites/vouchers`: Danh sách voucher đã tim.
* `POST /api/favorites/vouchers/:id/toggle`: Tim / Bỏ tim voucher.

---

## 7. MODULE 6: KHO VÍ VOUCHER CỦA NGƯỜI DÙNG (USER VOUCHERS)
Tiền tố route: `/api/user-vouchers` | **Auth**: `Bearer Token`

### 7.1. Lấy danh sách ví voucher (Wallet)
* **URL**: `/api/user-vouchers?status=available`
* **Query Params**: `status` (`available`, `used`, `expired`, `all`)
* **Response Mẫu (200 OK)**:
```json
{
  "success": true,
  "message": "Lấy danh sách ví voucher thành công",
  "data": [
    {
      "_id": "6ae621e8beaaf41707e02c42",
      "voucherId": "6ae621e8beaaf41707e02c38",
      "voucherCode": "SS829104",
      "orderCode": "ORD-71500",
      "title": "Giảm 40% ShackBurger Kèm Khoai Tây Chiên Lượn Sóng",
      "brandName": "Shake Shack",
      "brandLogo": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80",
      "discountDisplay": "40% OFF",
      "sellingPrice": 75000,
      "originalValue": 125000,
      "status": "AVAILABLE",
      "statusText": "Khả dụng",
      "isUsed": false,
      "usedAt": null,
      "expirationDate": "2027-06-30T23:59:59.000Z",
      "purchasedDate": "2026-11-01T00:00:00.000Z"
    }
  ]
}
```

### 7.2. Sử dụng Voucher (Use Voucher)
* **URL**: `/api/user-vouchers/:id/use` *(Hỗ trợ `PATCH` và `POST`)*
* **Params**: `:id` - Truyền `_id` hoặc mã `voucherCode` (VD: `SS829104`).
* **Nghiệp vụ**: Cập nhật `is_used = true`, ghi nhận `used_at = now`, và tự động phát thông báo `REDEMPTION_CONFIRMED`.

---

## 8. MODULE 7: LỊCH SỬ ĐƠN HÀNG (ORDERS)
Tiền tố route: `/api/orders` | **Auth**: `Bearer Token`
* **Màn hình Frontend**: `/(user)/orders.tsx` và `/(user)/orders/[id].tsx`

### 8.1. Lấy danh sách lịch sử đơn hàng
* **URL**: `/api/orders`
* **Method**: `GET`
* **Query Params**:
  * `status`: `ALL`, `PAID`, `PENDING`, `FAILED`, `CANCELLED` (Mặc định: `ALL`).
  * `search`: Tìm kiếm theo mã đơn hàng `ORD-xxxxx`.
* **Response Mẫu (200 OK)**:
```json
{
  "success": true,
  "message": "Lấy lịch sử đơn hàng thành công",
  "data": [
    {
      "_id": "6ae621e8beaaf41707e02c41",
      "id": "ORD-71500",
      "orderCode": "ORD-71500",
      "voucherId": "6ae621e8beaaf41707e02c38",
      "voucherTitle": "Giảm 40% ShackBurger Kèm Khoai Tây Chiên Lượn Sóng",
      "brandName": "Shake Shack",
      "brandLogo": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80",
      "amount": 75000,
      "paymentMethod": "MoMo E-Wallet",
      "status": "PAID",
      "createdAt": "2026-11-01T00:00:00.000Z",
      "walletVoucherId": "6ae621e8beaaf41707e02c42",
      "voucherCode": "SS829104",
      "isUsed": false
    }
  ]
}
```

### 8.2. Chi tiết 1 đơn hàng
* **URL**: `/api/orders/:id`
* **Method**: `GET`
* **Params**: `:id` - ObjectId của đơn hàng hoặc mã đơn hàng `ORD-xxxxx`.
* **Response Mẫu (200 OK)**:
```json
{
  "success": true,
  "message": "Lấy chi tiết đơn hàng thành công",
  "data": {
    "_id": "6ae621e8beaaf41707e02c41",
    "id": "ORD-71500",
    "orderCode": "ORD-71500",
    "voucherId": "6ae621e8beaaf41707e02c38",
    "voucherTitle": "Giảm 40% ShackBurger Kèm Khoai Tây Chiên Lượn Sóng",
    "brandName": "Shake Shack",
    "brandLogo": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80",
    "amount": 75000,
    "paymentMethod": "MoMo E-Wallet",
    "status": "PAID",
    "createdAt": "2026-11-01T00:00:00.000Z",
    "walletVoucherId": "6ae621e8beaaf41707e02c42",
    "voucherCode": "SS829104",
    "isUsed": false,
    "usedAt": null,
    "expiresAt": "2027-06-30T23:59:59.000Z"
  }
}
```

---

## 9. MODULE 8: HỆ THỐNG THÔNG BÁO (NOTIFICATIONS)
Tiền tố route: `/api/notifications` | **Auth**: `Bearer Token`
* **Màn hình Frontend**: `/(user)/notifications.tsx`

### 9.1. Lấy danh sách thông báo & Số lượng chưa đọc
* **URL**: `/api/notifications`
* **Method**: `GET`
* **Response Mẫu (200 OK)**:
```json
{
  "success": true,
  "message": "Lấy danh sách thông báo thành công",
  "data": {
    "notifications": [
      {
        "_id": "6ae621e8beaaf41707e02c46",
        "id": "6ae621e8beaaf41707e02c46",
        "type": "PURCHASE_SUCCESS",
        "title": "Đơn hàng đã được xác nhận! 🎉",
        "message": "Voucher Shake Shack của bạn đã được cấp thành công vào ví voucher.",
        "isRead": false,
        "actionUrl": "/(user)/wallet",
        "createdAt": "Vừa xong",
        "timestamp": "2026-11-01T00:05:00.000Z"
      }
    ],
    "unreadCount": 1
  }
}
```

### 9.2. Đánh dấu 1 thông báo đã đọc
* **URL**: `/api/notifications/:id/read`
* **Method**: `PATCH`
* **Params**: `:id` - ObjectId của thông báo.

### 9.3. Đánh dấu tất cả thông báo là đã đọc
* **URL**: `/api/notifications/read-all`
* **Method**: `PATCH`

---

## 10. MODULE 9: CỔNG QUẢN LÝ ĐỐI TÁC & TOÀN SÀN (MANAGER PORTAL)
Tiền tố route: `/api/manager`  
**Yêu cầu xác thực**: Bắt buộc Bearer Token và tài khoản có quyền `role: "MANAGER"`.  
*(Ghi chú: Manager là quản trị viên chung toàn sàn, không bị bó hẹp trong bất kỳ brand nào. Mọi endpoint đều hỗ trợ xem toàn sàn hoặc kèm query `?brandId=...` để lọc)*.

---

### 10.1. Quản lý Thương hiệu Đối tác (Brand Management)

#### A. Lấy danh sách thương hiệu đối tác (Dropdown khi tạo voucher)
* **URL**: `/api/manager/brands`
* **Method**: `GET`
* **Response Mẫu**:
```json
{
  "success": true,
  "message": "Lấy danh sách thương hiệu đối tác thành công",
  "data": [
    {
      "_id": "6ae621e8beaaf41707e02c29",
      "name": "Starbucks Coffee",
      "code": "SB",
      "rating": 4.9,
      "logo_url": "https://images.unsplash.com/...",
      "activeVouchersCount": 2
    }
  ]
}
```

#### B. Thêm thương hiệu đối tác mới lên sàn
* **URL**: `/api/manager/brands`
* **Method**: `POST`
* **Request Body**:
```json
{
  "name": "Highlands Coffee",
  "code": "HL",
  "description": "Cà phê rang xay đậm đà bản sắc Việt Nam",
  "logo_url": "https://images.unsplash.com/...",
  "cover_image_url": "https://images.unsplash.com/...",
  "rating": 4.8
}
```
* **Response Mẫu (201 Created)**: Trả về đối tượng Brand vừa tạo kèm HTTP status 201.

---

### 10.2. Bảng Điều Khiển Thống Kê & KPI (Manager Dashboard)
* **URL**: `/api/manager/dashboard`
* **Method**: `GET`
* **Query Params**: `brandId` *(Tùy chọn: Để trống để xem toàn sàn, hoặc truyền ObjectId để lọc riêng cho thương hiệu đó)*.
* **Màn hình Frontend**: `/(manager)/(tabs)/dashboard.tsx`
* **Response Mẫu (200 OK)**:
```json
{
  "success": true,
  "message": "Lấy dữ liệu thống kê dashboard thành công",
  "data": {
    "stats": {
      "activeVouchers": 7,
      "totalOrders": 3,
      "issuedVouchers": 3,
      "simulatedRedemptions": 2,
      "totalRevenue": 205000
    },
    "recentOrders": [
      {
        "id": "ORD-94821",
        "voucherTitle": "Giảm 50% Toàn Bộ Menu Đồ Uống Mùa Thu",
        "brandName": "Starbucks Coffee",
        "amount": 45000,
        "status": "PAID",
        "createdAt": "2026-11-01T00:00:00.000Z"
      }
    ],
    "recentRedemptions": [
      {
        "id": "6ae621e8beaaf41707e02c40",
        "voucherCode": "SB184920",
        "customerName": "Alex Rivera",
        "voucherTitle": "Giảm 50% Toàn Bộ Menu Đồ Uống Mùa Thu",
        "redeemedDate": "2026-10-31 22:00",
        "status": "CONFIRMED"
      }
    ]
  }
}
```

---

### 10.3. Quản lý Chiến Dịch Voucher (Voucher Management)
* **Màn hình Frontend**: `/(manager)/(tabs)/vouchers.tsx`, `/create.tsx`, `/[id].tsx`, `/[id]/edit.tsx`

#### A. Lấy danh sách Voucher của đối tác
* **URL**: `/api/manager/vouchers`
* **Method**: `GET`
* **Query Params**:
  * `brandId`: Lọc theo thương hiệu.
  * `status`: `ALL`, `ACTIVE`, `PAUSED`, `DRAFT`, `ENDED`.
  * `search`: Tìm theo tiêu đề voucher.
  * `page`, `limit`.

#### B. Tạo Chiến dịch Voucher mới
* **URL**: `/api/manager/vouchers`
* **Method**: `POST`
* **Request Body**:
```json
{
  "brandId": "6ae621e8beaaf41707e02c29",
  "title": "Freeze Trà Xanh Giảm 30%",
  "description": "Trà xanh đá xay thơm bùi kèm thạch giòn sần sật.",
  "discountType": "PERCENTAGE",
  "discountValue": 30,
  "discountDisplay": "GIẢM 30%",
  "sellingPrice": 38000,
  "originalValue": 55000,
  "totalQuantity": 200,
  "startDate": "2026-11-01",
  "expirationDate": "2027-12-31",
  "usageConditions": [
    "Áp dụng tại tất cả chi nhánh toàn quốc.",
    "Không áp dụng đồng thời khuyến mãi khác."
  ],
  "coverImage": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80",
  "status": "ACTIVE"
}
```
* **Response Mẫu (201 Created)**: Trả về đối tượng Voucher chuẩn format `Voucher` của Frontend.

#### C. Xem chi tiết 1 Voucher
* **URL**: `/api/manager/vouchers/:id` | **Method**: `GET`

#### D. Chỉnh sửa thông tin Voucher
* **URL**: `/api/manager/vouchers/:id` | **Method**: `PUT`
* **Request Body**: Gửi các trường cần cập nhật (`title`, `description`, `sellingPrice`, `originalValue`, `totalQuantity`, `expirationDate`, `usageConditions`).

#### E. Đổi nhanh trạng thái Voucher (Quick Toggle Status)
* **URL**: `/api/manager/vouchers/:id/status`
* **Method**: `PATCH`
* **Request Body**:
```json
{
  "status": "PAUSED"
}
```

---

### 10.4. Quản lý Đơn Hàng Đối Tác (Manager Orders)
* **URL**: `/api/manager/orders`
* **Method**: `GET`
* **Màn hình Frontend**: `/(manager)/(tabs)/orders.tsx`
* **Query Params**: `brandId`, `status` (`ALL`, `PAID`, `PENDING`, `CANCELLED`), `search`, `page`, `limit`.
* **Response Mẫu (200 OK)**:
```json
{
  "success": true,
  "message": "Lấy danh sách đơn hàng đối tác thành công",
  "data": {
    "orders": [
      {
        "_id": "6ae621e8beaaf41707e02c3f",
        "id": "ORD-94821",
        "orderCode": "ORD-94821",
        "customerName": "Alex Rivera",
        "customerEmail": "user.alex@example.com",
        "customerPhone": "0912 345 678",
        "voucherTitle": "Giảm 50% Toàn Bộ Menu Đồ Uống Mùa Thu",
        "brandName": "Starbucks Coffee",
        "amount": 45000,
        "paymentMethod": "Credit Card",
        "status": "PAID",
        "createdAt": "2026-11-01T00:00:00.000Z",
        "voucherCode": "SB184920",
        "isUsed": true
      }
    ],
    "total": 3,
    "page": 1,
    "limit": 20
  }
}
```

---

### 10.5. Nhật Ký Sử Dụng Mã & Xác Thực Tại Quầy (Redemptions & Verification)
* **Màn hình Frontend**: `/(manager)/(tabs)/redemptions.tsx`

#### A. Lấy lịch sử sử dụng mã voucher tại cửa hàng
* **URL**: `/api/manager/redemptions`
* **Method**: `GET`
* **Query Params**: `brandId`, `search`, `page`, `limit`.
* **Response Mẫu (Khớp thẻ giao diện ManagerRedemption)**:
```json
{
  "success": true,
  "message": "Lấy lịch sử sử dụng mã voucher thành công",
  "data": {
    "redemptions": [
      {
        "id": "6ae621e8beaaf41707e02c40",
        "voucherId": "6ae621e8beaaf41707e02c36",
        "voucherTitle": "Giảm 50% Toàn Bộ Menu Đồ Uống Mùa Thu",
        "voucherCode": "SB184920",
        "customerName": "Alex Rivera",
        "customerPhone": "0912 345 678",
        "brandName": "Starbucks Coffee",
        "redeemedDate": "2026-10-31 22:00",
        "status": "CONFIRMED"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

#### B. Kiểm tra tính hợp lệ của mã voucher tại quầy (Verify Code)
* **URL**: `/api/manager/redemptions/verify`
* **Method**: `POST`
* **Request Body**:
```json
{
  "voucherCode": "SB184920"
}
```
* **Response Mẫu**:
```json
{
  "success": true,
  "message": "Kiểm tra mã voucher thành công",
  "data": {
    "voucherCode": "SB184920",
    "validityStatus": "VALID",
    "validityMessage": "Mã hợp lệ, sẵn sàng áp dụng giảm giá",
    "isUsed": false,
    "customer": {
      "name": "Alex Rivera",
      "phone": "0912 345 678"
    },
    "voucher": {
      "title": "Giảm 50% Toàn Bộ Menu Đồ Uống Mùa Thu",
      "discountDisplay": "50% OFF",
      "sellingPrice": 45000,
      "brandName": "Starbucks Coffee"
    }
  }
}
```

#### C. Xác nhận đổi voucher tại quầy (Counter Redeem)
* **URL**: `/api/manager/redemptions/redeem`
* **Method**: `POST`
* **Request Body**:
```json
{
  "voucherCode": "SB184920"
}
```
* **Response Mẫu (200 OK)**:
```json
{
  "success": true,
  "message": "Xác nhận đổi voucher tại quầy thành công",
  "data": {
    "voucherCode": "SB184920",
    "status": "CONFIRMED",
    "redeemedDate": "2026-11-01 00:15",
    "customerName": "Alex Rivera",
    "voucherTitle": "Giảm 50% Toàn Bộ Menu Đồ Uống Mùa Thu"
  }
}
```

---

## 11. KIỂM TRA TRẠNG THÁI SERVER (HEALTH CHECK)
* **URL**: `/api/health` | **Method**: `GET`
```json
{
  "status": "ok",
  "service": "voucher-platform backend",
  "timestamp": "2026-11-01T00:00:00.000Z"
}
```

---

## 12. BỘ LỆNH cURL KIỂM THỬ MẪU (QUICK cURL CHEAT SHEET)

```bash
# 1. Đăng nhập User lấy Token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user.alex@example.com","password":"Voucher2026!"}'

# 2. Cập nhật hồ sơ User
curl -X PUT http://localhost:5000/api/auth/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -d '{"full_name":"Alex Rivera Pro","phone":"0988 888 999"}'

# 3. Lấy lịch sử đơn hàng User
curl -X GET "http://localhost:5000/api/orders?status=ALL" \
  -H "Authorization: Bearer <USER_TOKEN>"

# 4. Lấy danh sách thông báo User
curl -X GET http://localhost:5000/api/notifications \
  -H "Authorization: Bearer <USER_TOKEN>"

# 5. Mua voucher (Giao dịch Atomic)
curl -X POST http://localhost:5000/api/vouchers/<VOUCHER_ID>/buy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -d '{"paymentMethod":"MoMo E-Wallet"}'

# 6. Đăng nhập Manager
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager.sarah@brandhub.com","password":"Manager2026!"}'

# 7. Lấy thống kê Dashboard Manager toàn sàn
curl -X GET http://localhost:5000/api/manager/dashboard \
  -H "Authorization: Bearer <MANAGER_TOKEN>"

# 8. Manager tạo thương hiệu đối tác mới
curl -X POST http://localhost:5000/api/manager/brands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <MANAGER_TOKEN>" \
  -d '{"name":"Highlands Coffee","code":"HL","description":"Cà phê rang xay đậm đà"}'

# 9. Manager tạo voucher mới
curl -X POST http://localhost:5000/api/manager/vouchers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <MANAGER_TOKEN>" \
  -d '{
    "brandId":"<BRAND_ID>",
    "title":"Freeze Trà Xanh Giảm 30%",
    "sellingPrice":38000,
    "originalValue":55000,
    "totalQuantity":100,
    "expirationDate":"2027-12-31",
    "status":"ACTIVE"
  }'

# 10. Manager kiểm tra mã voucher tại quầy
curl -X POST http://localhost:5000/api/manager/redemptions/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <MANAGER_TOKEN>" \
  -d '{"voucherCode":"SB184920"}'
```
