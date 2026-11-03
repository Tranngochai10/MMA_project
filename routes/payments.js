const router = require('express').Router();
const authenticate = require('../middlewares/authenticate');
const authorizeRoles = require('../middlewares/authorizeRoles');
const asyncHandler = require('../utils/asyncHandler');
const rateLimit = require('../middlewares/rateLimit');
const service = require('../services/paymentService');
const { sendSuccess } = require('../utils/ApiResponse');
router.use(authenticate);
router.post('/mb', rateLimit({ max: 15, windowMs: 15 * 60000 }), asyncHandler(async (req, res) => {
  sendSuccess(res, 201, 'Đơn đang chờ chuyển khoản.', await service.createTransferOrder(req.body.voucherId, req.user._id, req.get('Idempotency-Key')));
}));
router.get('/mb/:id', asyncHandler(async (req, res) => {
  sendSuccess(res, 200, 'Thông tin thanh toán.', await service.getTransferOrder(req.params.id, req.user._id));
}));
router.post('/mb/:id/confirm', authorizeRoles('MANAGER'), asyncHandler(async (req, res) => {
  sendSuccess(res, 200, 'Đã xác nhận nhận tiền và cấp voucher.', await service.confirmTransfer(req.params.id, req.user._id, req.body));
}));
router.post('/mb/:id/cancel', authorizeRoles('MANAGER'), asyncHandler(async (req, res) => {
  sendSuccess(res, 200, 'Đã hủy đơn.', await service.cancelTransfer(req.params.id));
}));
module.exports = router;
