const managerService = require('../services/managerService');
const { sendSuccess } = require('../utils/apiResponse');

// 1. Brands
async function getBrands(req, res) {
  const brands = await managerService.getManagerBrands();
  return sendSuccess(res, 200, 'Lấy danh sách thương hiệu đối tác thành công', brands);
}

async function getBrandById(req, res) {
  const brand = await managerService.getManagerBrandById(req.params.id);
  return sendSuccess(res, 200, 'Lấy chi tiết thương hiệu thành công', brand);
}

async function createBrand(req, res) {
  const brand = await managerService.createManagerBrand(req.body);
  return sendSuccess(res, 201, 'Thêm mới thương hiệu đối tác thành công', brand);
}

async function updateBrand(req, res) {
  const brand = await managerService.updateManagerBrand(req.params.id, req.body);
  return sendSuccess(res, 200, 'Cập nhật thông tin thương hiệu thành công', brand);
}

// 2. Dashboard
async function getDashboard(req, res) {
  const data = await managerService.getDashboardStats(req.query);
  return sendSuccess(res, 200, 'Lấy dữ liệu thống kê dashboard thành công', data);
}

// 3. Vouchers
async function getVouchers(req, res) {
  const data = await managerService.getManagerVouchers(req.query);
  return sendSuccess(res, 200, 'Lấy danh sách chiến dịch voucher thành công', data);
}

async function getVoucherById(req, res) {
  const voucher = await managerService.getManagerVoucherById(req.params.id);
  return sendSuccess(res, 200, 'Lấy chi tiết voucher thành công', voucher);
}

async function createVoucher(req, res) {
  const voucher = await managerService.createManagerVoucher(req.user._id, req.body);
  return sendSuccess(res, 201, 'Tạo chiến dịch voucher thành công', voucher);
}

async function updateVoucher(req, res) {
  const voucher = await managerService.updateManagerVoucher(req.params.id, req.body);
  return sendSuccess(res, 200, 'Cập nhật chiến dịch voucher thành công', voucher);
}

async function updateVoucherStatus(req, res) {
  const voucher = await managerService.updateManagerVoucherStatus(req.params.id, req.body.status);
  return sendSuccess(res, 200, `Chuyển trạng thái voucher sang ${req.body.status} thành công`, voucher);
}

// 4. Orders
async function getOrders(req, res) {
  const data = await managerService.getManagerOrders(req.query);
  return sendSuccess(res, 200, 'Lấy danh sách đơn hàng đối tác thành công', data);
}

// 5. Redemptions & Verification
async function getRedemptions(req, res) {
  const data = await managerService.getManagerRedemptions(req.query);
  return sendSuccess(res, 200, 'Lấy lịch sử sử dụng mã voucher thành công', data);
}

async function verifyVoucher(req, res) {
  const result = await managerService.verifyVoucherAtCounter(req.body.voucherCode);
  return sendSuccess(res, 200, 'Kiểm tra mã voucher thành công', result);
}

async function redeemVoucher(req, res) {
  const result = await managerService.redeemVoucherAtCounter(req.body.voucherCode, req.user._id);
  return sendSuccess(res, 200, 'Xác nhận đổi voucher tại quầy thành công', result);
}

module.exports = {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  getDashboard,
  getVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  updateVoucherStatus,
  getOrders,
  getRedemptions,
  verifyVoucher,
  redeemVoucher
};
