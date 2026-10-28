const express = require('express');

const authController = require('../controllers/authController');
const authenticate = require('../middlewares/authenticate');
const asyncHandler = require('../utils/asyncHandler');
const {
  validateChangePassword,
  validateLogin,
  validateRegister
} = require('../validators/authValidator');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, asyncHandler(authController.register));
router.post('/login', validateLogin, asyncHandler(authController.login));

// Protected routes (Requires Bearer Token)
router.get('/me', authenticate, asyncHandler(authController.getMe));
router.post(
  '/change-password',
  authenticate,
  validateChangePassword,
  asyncHandler(authController.changePassword)
);
router.post('/logout', authenticate, asyncHandler(authController.logout));

module.exports = router;
