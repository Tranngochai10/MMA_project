const express = require('express');
const userVoucherController = require('../controllers/userVoucherController');
const authenticate = require('../middlewares/authenticate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Ví voucher cá nhân (yêu cầu Bearer Token)
router.use(authenticate);

// Lấy danh sách ví voucher
router.get('/', asyncHandler(userVoucherController.getMyWallet));

// Sử dụng voucher (hỗ trợ cả PATCH /:id/use, POST /:id/use và POST /use kèm body)
router.patch('/:id/use', asyncHandler(userVoucherController.useVoucher));
router.post('/:id/use', asyncHandler(userVoucherController.useVoucher));
router.post('/use', asyncHandler(userVoucherController.useVoucher));

module.exports = router;
