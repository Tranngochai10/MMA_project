const express = require('express');

const authController = require('../controllers/authController');
const authenticate = require('../middlewares/authenticate');
const asyncHandler = require('../utils/asyncHandler');
const {
  validateChangePassword,
  validateForgotPassword,
  validateLogin,
  validateRegister,
  validateResetPassword
} = require('../validators/authValidator');

const router = express.Router();
const rateLimit = require('../middlewares/rateLimit');
const recoveryLimit = rateLimit({ max: 10, windowMs: 15 * 60 * 1000 });
const loginLimit = rateLimit({ max: 30, windowMs: 15 * 60 * 1000 });
router.use('/login', loginLimit);
router.use('/forgot-password', recoveryLimit);
router.use('/reset-password', recoveryLimit);

// Public routes
router.post('/register', validateRegister, asyncHandler(authController.register));
router.post('/login', validateLogin, asyncHandler(authController.login));
router.post('/forgot-password', validateForgotPassword, asyncHandler(authController.forgotPassword));
router.post('/reset-password', validateResetPassword, asyncHandler(authController.resetPassword));

// Protected routes (Requires Bearer Token)
router.get('/me', authenticate, asyncHandler(authController.getMe));
router.put('/me', authenticate, asyncHandler(authController.updateMe));
router.patch('/me', authenticate, asyncHandler(authController.updateMe));
router.post(
  '/change-password',
  authenticate,
  validateChangePassword,
  asyncHandler(authController.changePassword)
);
router.post('/logout', authenticate, asyncHandler(authController.logout));

module.exports = router;
