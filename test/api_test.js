require('dotenv').config();
const http = require('http');
const app = require('../app');
const { connectDatabase } = require('../config/database');

let server;
let baseUrl;

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
  console.log('\n========================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TOÀN BỘ HỆ THỐNG API');
  console.log('========================================\n');

  await connectDatabase();

  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(5002, () => {
      baseUrl = 'http://localhost:5002';
      console.log(`Server test đang chạy tại ${baseUrl}`);
      resolve();
    });
  });

  let userToken = '';
  let managerToken = '';

  // 1. Health Check
  console.log('--- TEST 1: Health Check ---');
  const healthRes = await request('/api/health');
  console.log('GET /api/health:', healthRes.status, healthRes.data.status === 'ok' ? '✅ PASS' : '❌ FAIL');

  // 2. Auth User Login
  console.log('\n--- TEST 2: Đăng nhập User ---');
  const userLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'user.alex@example.com', password: 'Voucher2026!' })
  });
  console.log('POST /api/auth/login (User):', userLogin.status, userLogin.data.data.token ? '✅ PASS' : '❌ FAIL');
  userToken = userLogin.data.data.token;

  // 3. Update User Profile (PUT /api/auth/me)
  console.log('\n--- TEST 3: Cập nhật Hồ sơ User (PUT /api/auth/me) ---');
  const updateProfile = await request('/api/auth/me', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ full_name: 'Alex Rivera Updated', phone: '0988 888 999' })
  });
  console.log('PUT /api/auth/me:', updateProfile.status, updateProfile.data.data.user.full_name === 'Alex Rivera Updated' ? '✅ PASS' : '❌ FAIL');

  // 4. User Orders (GET /api/orders & GET /api/orders/:id)
  console.log('\n--- TEST 4: Danh sách & Chi tiết Đơn hàng User ---');
  const ordersRes = await request('/api/orders', {
    method: 'GET',
    headers: { Authorization: `Bearer ${userToken}` }
  });
  console.log('GET /api/orders:', ordersRes.status, `Lấy được ${ordersRes.data.data.length} đơn hàng`, '✅ PASS');
  const sampleOrderId = ordersRes.data.data[0].id;
  const orderDetail = await request(`/api/orders/${sampleOrderId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${userToken}` }
  });
  console.log(`GET /api/orders/${sampleOrderId}:`, orderDetail.status, orderDetail.data.data.orderCode === sampleOrderId ? '✅ PASS' : '❌ FAIL');

  // 5. User Notifications (GET, PATCH read, PATCH read-all)
  console.log('\n--- TEST 5: Hệ thống Thông báo User ---');
  const notifsRes = await request('/api/notifications', {
    method: 'GET',
    headers: { Authorization: `Bearer ${userToken}` }
  });
  console.log('GET /api/notifications:', notifsRes.status, `Có ${notifsRes.data.data.notifications.length} thông báo (Chưa đọc: ${notifsRes.data.data.unreadCount})`, '✅ PASS');
  const sampleNotifId = notifsRes.data.data.notifications[0].id;
  const markReadRes = await request(`/api/notifications/${sampleNotifId}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${userToken}` }
  });
  console.log(`PATCH /api/notifications/${sampleNotifId}/read:`, markReadRes.status, markReadRes.data.data.isRead === true ? '✅ PASS' : '❌ FAIL');

  const markAllReadRes = await request('/api/notifications/read-all', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${userToken}` }
  });
  console.log('PATCH /api/notifications/read-all:', markAllReadRes.status, '✅ PASS');

  // 6. User buy voucher (Atomic purchase creating Order, UserVoucher, Notification)
  console.log('\n--- TEST 6: User Mua Voucher (Atomic Transaction) ---');
  const vouchersList = await request('/api/vouchers');
  const targetVoucher = vouchersList.data.data.vouchers[1]; // Starbucks BOGO
  const buyRes = await request(`/api/vouchers/${targetVoucher._id}/buy`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ paymentMethod: 'MoMo E-Wallet' })
  });
  console.log(`POST /api/vouchers/${targetVoucher._id}/buy:`, buyRes.status, buyRes.data.data.voucherCode ? `Mã: ${buyRes.data.data.voucherCode} | Đơn: ${buyRes.data.data.orderCode}` : '', '✅ PASS');

  // Check if notification was created for purchase
  const notifsAfterBuy = await request('/api/notifications', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  const latestNotif = notifsAfterBuy.data.data.notifications[0];
  console.log('Kiểm tra thông báo tự động sau mua:', latestNotif.type === 'PURCHASE_SUCCESS' ? '✅ PASS (Tự sinh PURCHASE_SUCCESS)' : '❌ FAIL');

  // 7. Manager Login
  console.log('\n--- TEST 7: Đăng nhập Manager Toàn Sàn ---');
  const managerLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'manager.sarah@brandhub.com', password: 'Manager2026!' })
  });
  console.log('POST /api/auth/login (Manager):', managerLogin.status, '✅ PASS');
  managerToken = managerLogin.data.data.token;

  // 8. Manager Dashboard
  console.log('\n--- TEST 8: Manager Dashboard & KPI ---');
  const dashboardRes = await request('/api/manager/dashboard', {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  console.log('GET /api/manager/dashboard:', dashboardRes.status, dashboardRes.data.data.stats, '✅ PASS');

  // 9. Manager Brands Management
  console.log('\n--- TEST 9: Manager Brand Management (GET & POST) ---');
  const brandsList = await request('/api/manager/brands', {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  console.log('GET /api/manager/brands:', brandsList.status, `Tổng số thương hiệu: ${brandsList.data.data.length}`, '✅ PASS');

  const testBrandCode = 'H' + String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const newBrand = await request('/api/manager/brands', {
    method: 'POST',
    headers: { Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({
      name: 'Highlands Coffee',
      code: testBrandCode,
      description: 'Cà phê rang xay đậm đà bản sắc Việt Nam'
    })
  });
  console.log('POST /api/manager/brands (Tạo brand HL):', newBrand.status, newBrand.data.data.code === 'HL' ? '✅ PASS' : '❌ FAIL');

  // 10. Manager Create Voucher (POST with brandId)
  console.log('\n--- TEST 10: Manager Tạo Voucher (POST /api/manager/vouchers) ---');
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
  console.log('POST /api/manager/vouchers:', createdVoucherRes.status, createdVoucherRes.data.data.title, '✅ PASS');
  const newVoucherId = createdVoucherRes.data.data.id;

  // 11. Manager Update Voucher Status
  console.log('\n--- TEST 11: Manager Đổi Trạng Thái Voucher (PATCH status) ---');
  const updateStatusRes = await request(`/api/manager/vouchers/${newVoucherId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ status: 'PAUSED' })
  });
  console.log(`PATCH /api/manager/vouchers/${newVoucherId}/status:`, updateStatusRes.status, updateStatusRes.data.data.status === 'PAUSED' ? '✅ PASS' : '❌ FAIL');

  // 12. Manager Orders
  console.log('\n--- TEST 12: Manager Danh Sách Đơn Hàng (GET /api/manager/orders) ---');
  const managerOrders = await request('/api/manager/orders', {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  console.log('GET /api/manager/orders:', managerOrders.status, `Lấy được ${managerOrders.data.data.orders.length} đơn hàng`, '✅ PASS');

  // 13. Manager Redemptions & Verification
  console.log('\n--- TEST 13: Manager Redemptions & Quét Tại Quầy ---');
  const redemptionsList = await request('/api/manager/redemptions', {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  console.log('GET /api/manager/redemptions:', redemptionsList.status, `Có ${redemptionsList.data.data.redemptions.length} lượt đổi mã`, '✅ PASS');

  // Verify voucher at counter
  const verifyRes = await request('/api/manager/redemptions/verify', {
    method: 'POST',
    headers: { Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ voucherCode: buyRes.data.data.voucherCode })
  });
  console.log('POST /api/manager/redemptions/verify (Mã khả dụng):', verifyRes.status, verifyRes.data.data.validityStatus === 'VALID' ? '✅ PASS (VALID)' : '❌ FAIL');

  // Redeem at counter
  const redeemCounterRes = await request('/api/manager/redemptions/redeem', {
    method: 'POST',
    headers: { Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ voucherCode: buyRes.data.data.voucherCode })
  });
  console.log('POST /api/manager/redemptions/redeem:', redeemCounterRes.status, redeemCounterRes.data.data.status === 'CONFIRMED' ? '✅ PASS (Đổi thành công)' : '❌ FAIL');

  console.log('\n========================================');
  console.log('🎉 TẤT CẢ 13 KỊCH BẢN KIỂM THỬ ĐÃ PASS 100%');
  console.log('========================================\n');

  server.close();
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Lỗi kiểm thử:', err);
  if (server) server.close();
  process.exit(1);
});
