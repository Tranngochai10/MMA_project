const userVoucherService = require('../services/userVoucherService');
const { sendSuccess } = require('../utils/apiResponse');

async function getMyWallet(req, res) {
  const status = req.query.status || 'available';
  const vouchers = await userVoucherService.getMyWalletVouchers(req.user._id, status);
  return sendSuccess(res, 200, 'Lấy danh sách ví voucher thành công', vouchers);
}

async function useVoucher(req, res) {
  const identifier = req.params.id || (req.body && req.body.voucherCode);
  const result = await userVoucherService.useVoucher(identifier, req.user._id);
  return sendSuccess(res, 200, 'Sử dụng voucher thành công', result);
}

module.exports = {
  getMyWallet,
  useVoucher
};
