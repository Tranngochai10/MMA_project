const voucherService = require('../services/voucherService');
const { sendSuccess } = require('../utils/apiResponse');

async function getVouchers(req, res) {
  const currentUserId = req.user ? req.user._id : null;
  const result = await voucherService.getVouchers({
    categoryId: req.query.categoryId,
    brandId: req.query.brandId,
    search: req.query.search,
    sort: req.query.sort,
    page: req.query.page || 1,
    limit: req.query.limit || 20,
    currentUserId
  });

  return sendSuccess(res, 200, 'Lấy danh sách voucher thành công', result);
}

async function getVoucherById(req, res) {
  const currentUserId = req.user ? req.user._id : null;
  const voucher = await voucherService.getVoucherById(req.params.id, currentUserId);
  return sendSuccess(res, 200, 'Lấy chi tiết voucher thành công', voucher);
}

async function buyVoucher(req, res) {
  const voucherId = req.params.id;
  const userId = req.user._id;
  const paymentMethod = (req.body && req.body.paymentMethod) || 'Credit Card';

  const orderResult = await voucherService.buyVoucher(voucherId, userId, paymentMethod);
  return sendSuccess(res, 200, 'Thanh toán và nhận voucher thành công', orderResult);
}

module.exports = {
  getVouchers,
  getVoucherById,
  buyVoucher
};
