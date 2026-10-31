const express = require('express');
const notificationController = require('../controllers/notificationController');
const authenticate = require('../middlewares/authenticate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(notificationController.getMyNotifications));
router.patch('/read-all', asyncHandler(notificationController.markAllAsRead));
router.patch('/:id/read', asyncHandler(notificationController.markAsRead));

module.exports = router;
