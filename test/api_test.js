require('dotenv').config();
const http = require('http');
const app = require('../app');
const { connectDatabase } = require('../config/database');

let server;
let baseUrl;
let passedTests = 0;
let totalTests = 0;

function assertTest(condition, testName, extraInfo = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${testName} ${extraInfo ? `-> ${extraInfo}` : ''}`);
    return true;
  } else {
    console.error(`[FAIL] ${testName} ${extraInfo ? `-> ${extraInfo}` : ''}`);
    return false;
  }
}

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TOÀN DIỆN TẤT CẢ CÁC API BACKEND');
  console.log('======================================================\n');

  await connectDatabase();

  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(5002, () => {
      baseUrl = 'http://localhost:5002';
      console.log(`Server test đang chạy tại ${baseUrl}\n`);
      resolve();
    });
  });

  let userToken = '';
  let managerToken = '';

  // -----------------------------------------------------------
  // 1. Health Check
  // -----------------------------------------------------------
  console.log('--- NHÓM 1: Health Check & System Status ---');
  const healthRes = await request('/api/health');
  assertTest(healthRes.status === 200 && healthRes.data?.status === 'ok', 'GET /api/health (Server online)');

  // -----------------------------------------------------------
  // 2. Authentication (User)
  // -----------------------------------------------------------
  console.log('\n--- NHÓM 2: Xác Thực Tài Khoản (Authentication) ---');
  const tempEmail = `test.user_${Date.now()}@example.com`;
  const registerRes = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      full_name: 'Test Candidate',
      email: tempEmail,
      password: 'Password123!',
      phone: '0901234567'
    })
  });
  assertTest(registerRes.status === 201 && registerRes.data?.data?.token, 'POST /api/auth/register (Đăng ký tài khoản mới)');

  const userLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'user.alex@example.com', password: 'Voucher2026!' })
  });
  assertTest(userLogin.status === 200 && userLogin.data?.data?.token, 'POST /api/auth/login (Đăng nhập vai trò User)');
  userToken = userLogin.data.data.token;

  const getMeRes = await request('/api/auth/me', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assertTest(getMeRes.status === 200 && getMeRes.data?.data?.user?.email === 'user.alex@example.com', 'GET /api/auth/me (Lấy hồ sơ cá nhân)');

  const updateProfile = await request('/api/auth/me', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ full_name: 'Alex Rivera Updated', phone: '0988 888 999' })
  });
  assertTest(updateProfile.status === 200 && updateProfile.data?.data?.user?.full_name === 'Alex Rivera Updated', 'PUT /api/auth/me (Cập nhật hồ sơ cá nhân)');

  // 2.5. Forgot & Reset Password (Demo)
  const forgotRes = await request('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: 'user.alex@example.com' })
  });
  assertTest(forgotRes.status === 200 && forgotRes.data?.data?.mockOtp === '123456', 'POST /api/auth/forgot-password (Lấy mã mockOtp phục vụ demo)');

  const resetRes = await request('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      email: 'user.alex@example.com',
      otp: forgotRes.data?.data?.mockOtp || '123456',
      new_password: 'Voucher2026!'
    })
  });
  assertTest(resetRes.status === 200 && resetRes.data?.success === true, 'POST /api/auth/reset-password (Đặt lại mật khẩu mới)');

  // -----------------------------------------------------------
  // 3. Categories
  // -----------------------------------------------------------
  console.log('\n--- NHÓM 3: Danh Mục Ngành Hàng (Categories) ---');
  const catRes = await request('/api/categories');
  assertTest(catRes.status === 200 && Array.isArray(catRes.data?.data) && catRes.data.data.length > 0, 'GET /api/categories (Danh sách danh mục)', `Tổng: ${catRes.data?.data?.length}`);
  const sampleCategoryId = catRes.data?.data?.[0]?._id;

  // -----------------------------------------------------------
  // 4. Brands (Public & User)
  // -----------------------------------------------------------
  console.log('\n--- NHÓM 4: Thương Hiệu Đối Tác (Brands) ---');
  const brandsRes = await request('/api/brands', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assertTest(brandsRes.status === 200 && Array.isArray(brandsRes.data?.data) && brandsRes.data.data.length > 0, 'GET /api/brands (Danh sách thương hiệu nổi bật)');
  const sampleBrand = brandsRes.data.data[0];
  const brandDetailRes = await request(`/api/brands/${sampleBrand._id}`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assertTest(brandDetailRes.status === 200 && brandDetailRes.data?.data?.name === sampleBrand.name, `GET /api/brands/${sampleBrand._id} (Chi tiết thương hiệu)`);

  // -----------------------------------------------------------
  // 5. Vouchers (Discovery & Purchase)
  // -----------------------------------------------------------
  console.log('\n--- NHÓM 5: Khám Phá & Săn Voucher (Vouchers) ---');
  const vouchersRes = await request('/api/vouchers', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assertTest(vouchersRes.status === 200 && Array.isArray(vouchersRes.data?.data?.vouchers), 'GET /api/vouchers (Danh sách voucher thị trường)');
  
  const targetVoucher = vouchersRes.data.data.vouchers[0];
  const voucherDetailRes = await request(`/api/vouchers/${targetVoucher._id}`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assertTest(voucherDetailRes.status === 200 && voucherDetailRes.data?.data?._id === targetVoucher._id, `GET /api/vouchers/${targetVoucher._id} (Chi tiết voucher)`);

  // -----------------------------------------------------------
  // 6. Favorites (Yêu thích)
  // -----------------------------------------------------------
  console.log('\n--- NHÓM 6: Mục Yêu Thích (Favorites) ---');
  const toggleBrandFav = await request(`/api/favorites/brands/${sampleBrand._id}/toggle`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assertTest(toggleBrandFav.status === 200, `POST /api/favorites/brands/${sampleBrand._id}/toggle (Yêu thích/Bỏ thích thương hiệu)`);

  const favBrandsList = await request('/api/favorites/brands', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assertTest(favBrandsList.status === 200 && Array.isArray(favBrandsList.data?.data), 'GET /api/favorites/brands (Danh sách thương hiệu yêu thích)');

  const toggleVoucherFav = await request(`/api/favorites/vouchers/${targetVoucher._id}/toggle`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assertTest(toggleVoucherFav.status === 200, `POST /api/favorites/vouchers/${targetVoucher._id}/toggle (Yêu thích/Bỏ thích voucher)`);

  const favVouchersList = await request('/api/favorites/vouchers', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assertTest(favVouchersList.status === 200 && Array.isArray(favVouchersList.data?.data), 'GET /api/favorites/vouchers (Danh sách voucher yêu thích)');

  // -----------------------------------------------------------
  // 7. Buy Voucher & Orders
  // -----------------------------------------------------------
  console.log('\n--- NHÓM 7: Mua Voucher & Quản Lý Đơn Hàng (Orders) ---');
  const buyRes = await request(`/api/vouchers/${targetVoucher._id}/buy`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ paymentMethod: 'MoMo E-Wallet' })
  });
  assertTest(buyRes.status === 200 && buyRes.data?.data?.voucherCode, `POST /api/vouchers/${targetVoucher._id}/buy (Mua voucher giao dịch Atomic)`, `Mã: ${buyRes.data?.data?.voucherCode} | Đơn: ${buyRes.data?.data?.orderCode}`);

  const ordersRes = await request('/api/orders', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assertTest(ordersRes.status === 200 && Array.isArray(ordersRes.data?.data) && ordersRes.data.data.length > 0, 'GET /api/orders (Lịch sử đơn hàng của người dùng)');

  const sampleOrderId = ordersRes.data.data[0].id;
  const orderDetail = await request(`/api/orders/${sampleOrderId}`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assertTest(orderDetail.status === 200 && orderDetail.data?.data?.orderCode === sampleOrderId, `GET /api/orders/${sampleOrderId} (Chi tiết 1 đơn hàng)`);

  // -----------------------------------------------------------
  // 8. Notifications
  // -----------------------------------------------------------
  console.log('\n--- NHÓM 8: Hệ Thống Thông Báo (Notifications) ---');
  const notifsRes = await request('/api/notifications', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assertTest(notifsRes.status === 200 && notifsRes.data?.data?.notifications, 'GET /api/notifications (Danh sách thông báo)');

  const sampleNotifId = notifsRes.data.data.notifications[0].id;
  const markReadRes = await request(`/api/notifications/${sampleNotifId}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assertTest(markReadRes.status === 200 && markReadRes.data?.data?.isRead === true, `PATCH /api/notifications/${sampleNotifId}/read (Đánh dấu đã đọc 1 thông báo)`);

  const markAllReadRes = await request('/api/notifications/read-all', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assertTest(markAllReadRes.status === 200, 'PATCH /api/notifications/read-all (Đánh dấu đã đọc tất cả)');

  // -----------------------------------------------------------
  // 9. User Wallet (Kho Ví & Sử Dụng Voucher)
  // -----------------------------------------------------------
  console.log('\n--- NHÓM 9: Kho Ví Voucher Của Người Dùng (Wallet) ---');
  const walletRes = await request('/api/user-vouchers?status=available', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assertTest(walletRes.status === 200 && Array.isArray(walletRes.data?.data), 'GET /api/user-vouchers (Danh sách voucher khả dụng trong ví)');

  // Use the newly bought voucher via self-redemption
  const userBoughtCode = buyRes.data?.data?.voucherCode;
  const selfUseRes = await request(`/api/user-vouchers/${userBoughtCode}/use`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assertTest(selfUseRes.status === 200 && selfUseRes.data?.data?.isUsed === true, `PATCH /api/user-vouchers/${userBoughtCode}/use (Tự kích hoạt sử dụng voucher trên app)`);

  // Chi tiết 1 voucher trong ví (hỗ trợ tra cứu bằng _id và voucherCode)
  const walletDetailById = await request(`/api/user-vouchers/${buyRes.data?.data?.walletVoucherId}`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assertTest(walletDetailById.status === 200 && walletDetailById.data?.data?.voucherCode === userBoughtCode, 'GET /api/user-vouchers/:id (Chi tiết ví bằng _id)');
  assertTest(Array.isArray(walletDetailById.data?.data?.usageConditions) && Boolean(walletDetailById.data?.data?.brandName), 'GET /api/user-vouchers/:id (Populate đầy đủ termsAndConditions & brand)');

  const walletDetailByCode = await request(`/api/user-vouchers/${userBoughtCode}`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assertTest(walletDetailByCode.status === 200 && walletDetailByCode.data?.data?.voucherCode === userBoughtCode, 'GET /api/user-vouchers/:id (Chi tiết ví bằng voucherCode)');

  // -----------------------------------------------------------
  // 10. Manager Authentication & Dashboard
  // -----------------------------------------------------------
  console.log('\n--- NHÓM 10: Quản Trị Viên Thương Hiệu / Sàn (Manager Portal) ---');
  const managerLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'manager.sarah@brandhub.com', password: 'Manager2026!' })
  });
  assertTest(managerLogin.status === 200 && managerLogin.data?.data?.token, 'POST /api/auth/login (Đăng nhập quyền MANAGER)');
  managerToken = managerLogin.data.data.token;

  const dashboardRes = await request('/api/manager/dashboard', {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  assertTest(dashboardRes.status === 200 && dashboardRes.data?.data?.stats, 'GET /api/manager/dashboard (Bảng thống kê KPI toàn sàn)');

  // -----------------------------------------------------------
  // 11. Manager Brand Management
  // -----------------------------------------------------------
  console.log('\n--- NHÓM 11: Manager Quản Lý Thương Hiệu Đối Tác ---');
  const managerBrandsList = await request('/api/manager/brands', {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  assertTest(managerBrandsList.status === 200 && Array.isArray(managerBrandsList.data?.data), 'GET /api/manager/brands (Danh sách thương hiệu cho Manager)');

  const testBrandCode = 'H' + String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const newBrand = await request('/api/manager/brands', {
    method: 'POST',
    headers: { Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({
      name: 'Highlands Coffee Special',
      code: testBrandCode,
      description: 'Cà phê rang xay đậm đà bản sắc Việt Nam',
      rating: 4.8
    })
  });
  assertTest(newBrand.status === 201 && newBrand.data?.data?.code === testBrandCode, `POST /api/manager/brands (Thêm thương hiệu mới: ${testBrandCode})`);

  // Xem chi tiết thương hiệu
  const mgrBrandDetail = await request(`/api/manager/brands/${newBrand.data.data._id}`, {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  assertTest(mgrBrandDetail.status === 200 && mgrBrandDetail.data?.data?.code === testBrandCode, `GET /api/manager/brands/:id (Manager xem chi tiết thương hiệu)`);

  // Chỉnh sửa thông tin thương hiệu
  const mgrUpdateBrand = await request(`/api/manager/brands/${newBrand.data.data._id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({
      description: 'Chuỗi cà phê đậm chất Việt Nam (Cập nhật)',
      rating: 4.9
    })
  });
  assertTest(mgrUpdateBrand.status === 200 && mgrUpdateBrand.data?.data?.rating === 4.9, `PUT /api/manager/brands/:id (Manager cập nhật thông tin thương hiệu)`);

  // -----------------------------------------------------------
  // 12. Manager Voucher Campaigns CRUD
  // -----------------------------------------------------------
  console.log('\n--- NHÓM 12: Manager Quản Lý Chiến Dịch Voucher ---');
  const createdVoucherRes = await request('/api/manager/vouchers', {
    method: 'POST',
    headers: { Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({
      brandId: newBrand.data.data._id,
      title: 'Freeze Trà Xanh Giảm 30%',
      description: 'Trà xanh đá xay thơm bùi kèm thạch giòn sần sật.',
      discountType: 'PERCENTAGE',
      discountValue: 30,
      sellingPrice: 38000,
      originalValue: 55000,
      totalQuantity: 200,
      expirationDate: '2027-12-31',
      status: 'ACTIVE'
    })
  });
  assertTest(createdVoucherRes.status === 201 && createdVoucherRes.data?.data?.id, 'POST /api/manager/vouchers (Tạo chiến dịch voucher mới)');
  const newVoucherId = createdVoucherRes.data?.data?.id;

  const managerVouchersList = await request('/api/manager/vouchers', {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  assertTest(managerVouchersList.status === 200 && Array.isArray(managerVouchersList.data?.data?.vouchers), 'GET /api/manager/vouchers (Danh sách chiến dịch đối tác)');

  const getMgrVoucherDetail = await request(`/api/manager/vouchers/${newVoucherId}`, {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  assertTest(getMgrVoucherDetail.status === 200 && getMgrVoucherDetail.data?.data?.id === newVoucherId, `GET /api/manager/vouchers/${newVoucherId} (Xem chi tiết chiến dịch)`);

  const updateMgrVoucher = await request(`/api/manager/vouchers/${newVoucherId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({
      title: 'Freeze Trà Xanh Giảm 35% Cực Hot',
      sellingPrice: 35000
    })
  });
  assertTest(updateMgrVoucher.status === 200 && updateMgrVoucher.data?.data?.sellingPrice === 35000, `PUT /api/manager/vouchers/${newVoucherId} (Cập nhật thông tin chiến dịch)`);

  const updateStatusRes = await request(`/api/manager/vouchers/${newVoucherId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ status: 'PAUSED' })
  });
  assertTest(updateStatusRes.status === 200 && updateStatusRes.data?.data?.status === 'PAUSED', `PATCH /api/manager/vouchers/${newVoucherId}/status (Chuyển trạng thái sang PAUSED)`);

  // -----------------------------------------------------------
  // 13. Manager Orders & Audit
  // -----------------------------------------------------------
  console.log('\n--- NHÓM 13: Manager Kiểm Toán Đơn Hàng Đối Tác ---');
  const managerOrders = await request('/api/manager/orders', {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  assertTest(managerOrders.status === 200 && Array.isArray(managerOrders.data?.data?.orders), 'GET /api/manager/orders (Lịch sử giao dịch khách hàng toàn sàn)');

  // -----------------------------------------------------------
  // 14. Manager Redemptions & Counter POS Verification
  // -----------------------------------------------------------
  console.log('\n--- NHÓM 14: Manager Xác Thực & Đổi Mã Tại Quầy ---');
  const redemptionsList = await request('/api/manager/redemptions', {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  assertTest(redemptionsList.status === 200 && Array.isArray(redemptionsList.data?.data?.redemptions), 'GET /api/manager/redemptions (Nhật ký đổi mã tại cửa hàng)');

  // Buy another voucher to verify & redeem at counter
  const freshBuy = await request(`/api/vouchers/${targetVoucher._id}/buy`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ paymentMethod: 'Marketplace Wallet' })
  });
  const freshCode = freshBuy.data?.data?.voucherCode;

  const verifyRes = await request('/api/manager/redemptions/verify', {
    method: 'POST',
    headers: { Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ voucherCode: freshCode })
  });
  assertTest(verifyRes.status === 200 && verifyRes.data?.data?.validityStatus === 'VALID', 'POST /api/manager/redemptions/verify (Quét mã voucher hợp lệ tại quầy)');

  const redeemCounterRes = await request('/api/manager/redemptions/redeem', {
    method: 'POST',
    headers: { Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ voucherCode: freshCode })
  });
  assertTest(redeemCounterRes.status === 200 && redeemCounterRes.data?.data?.status === 'CONFIRMED', 'POST /api/manager/redemptions/redeem (Xác nhận đổi voucher tại quầy thành công)');

  // -----------------------------------------------------------
  // KẾT QUẢ TỔNG HỢP
  // -----------------------------------------------------------
  console.log('\n======================================================');
  console.log(`📊 KẾT QUẢ KIỂM THỬ: ${passedTests}/${totalTests} TESTS PASS (${Math.round((passedTests/totalTests)*100)}%)`);
  if (passedTests === totalTests) {
    console.log('🎉 TẤT CẢ CÁC API HIỆN CÓ CỦA BACKEND ĐÃ PASS 100% HOÀN HẢO!');
  } else {
    console.error(`⚠️ CÓ ${totalTests - passedTests} TEST BỊ THẤT BẠI!`);
  }
  console.log('======================================================\n');

  server.close();
  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Lỗi kiểm thử hệ thống:', err);
  if (server) server.close();
  process.exit(1);
});
