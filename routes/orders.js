const express = require('express');
const orderController = require('../controllers/orderController');
const authenticate = require('../middlewares/authenticate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(orderController.getMyOrders));
router.get('/:id', asyncHandler(orderController.getOrderById));

module.exports = router;
