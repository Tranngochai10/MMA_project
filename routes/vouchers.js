const express = require('express');
const voucherController = require('../controllers/voucherController');
const authenticate = require('../middlewares/authenticate');
const optionalAuthenticate = require('../middlewares/optionalAuthenticate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Public routes (có hỗ trợ cá nhân hóa và favorite nếu kèm token)
router.get('/', optionalAuthenticate, asyncHandler(voucherController.getVouchers));
router.get('/:id', optionalAuthenticate, asyncHandler(voucherController.getVoucherById));

// Mua voucher (bắt buộc đăng nhập)
router.post('/:id/buy', authenticate, asyncHandler(voucherController.buyVoucher));

module.exports = router;
