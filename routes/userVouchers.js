const express = require('express');
const userVoucherController = require('../controllers/userVoucherController');
const authenticate = require('../middlewares/authenticate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Ví voucher cá nhân (yêu cầu Bearer Token)
router.use(authenticate);
router.get('/:id/qr', asyncHandler(async (req, res) => {
  const data = await require('../services/voucherQrService').createQr(req.params.id, req.user._id);
  require('../utils/ApiResponse').sendSuccess(res, 200, 'QR sử dụng voucher.', data);
}));

// Lấy danh sách ví voucher
router.get('/', asyncHandler(userVoucherController.getMyWallet));

// Lấy chi tiết 1 voucher trong ví (hỗ trợ _id hoặc voucherCode)
router.get('/:id', asyncHandler(userVoucherController.getWalletVoucherById));

// Sử dụng voucher (hỗ trợ cả PATCH /:id/use, POST /:id/use và POST /use kèm body)
router.patch('/:id/use', asyncHandler(userVoucherController.useVoucher));
router.post('/:id/use', asyncHandler(userVoucherController.useVoucher));
router.post('/use', asyncHandler(userVoucherController.useVoucher));

module.exports = router;
