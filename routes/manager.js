const express = require('express');
const brandUpload = require('../middlewares/brandUpload');
const managerController = require('../controllers/managerController');
const authenticate = require('../middlewares/authenticate');
const authorizeRoles = require('../middlewares/authorizeRoles');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// Tất cả các routes của Manager đều yêu cầu Bearer Token và Role MANAGER
router.use(authenticate, authorizeRoles(ROLES.MANAGER));
const rateLimit = require('../middlewares/rateLimit');
router.use('/redemptions/verify', rateLimit({ max: 60, windowMs: 15 * 60 * 1000 }));
router.use('/redemptions/redeem', rateLimit({ max: 60, windowMs: 15 * 60 * 1000 }));

// 1. Quản lý Thương hiệu Đối tác (Brand Management)
router.get('/brands', asyncHandler(managerController.getBrands));
router.post('/brands', brandUpload, asyncHandler(managerController.createBrand));
router.get('/brands/:id', asyncHandler(managerController.getBrandById));
router.put('/brands/:id', brandUpload, asyncHandler(managerController.updateBrand));

// 2. Thống kê & Dashboard
router.get('/dashboard', asyncHandler(managerController.getDashboard));

// 3. Quản lý Chiến dịch Voucher (Voucher CRUD & Status)
router.get('/vouchers', asyncHandler(managerController.getVouchers));
router.post('/vouchers', asyncHandler(managerController.createVoucher));
router.get('/vouchers/:id', asyncHandler(managerController.getVoucherById));
router.put('/vouchers/:id', asyncHandler(managerController.updateVoucher));
router.patch('/vouchers/:id/status', asyncHandler(managerController.updateVoucherStatus));

// 4. Quản lý Đơn hàng (Orders)
router.get('/orders', asyncHandler(managerController.getOrders));

// 5. Nhật ký Sử dụng mã & Xác thực tại quầy (Redemptions & Verification)
router.get('/redemptions', asyncHandler(managerController.getRedemptions));
router.post('/redemptions/verify', asyncHandler(managerController.verifyVoucher));
router.post('/redemptions/redeem', asyncHandler(managerController.redeemVoucher));

module.exports = router;
