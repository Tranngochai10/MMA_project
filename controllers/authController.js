const authService = require('../services/authService');
const { sendSuccess } = require('../utils/apiResponse');

async function register(req, res) {
  const data = await authService.register(req.validatedBody);
  return sendSuccess(res, 201, 'Đăng ký tài khoản thành công', data);
}

async function login(req, res) {
  const data = await authService.login(req.validatedBody);
  return sendSuccess(res, 200, 'Đăng nhập thành công', data);
}

async function getMe(req, res) {
  const data = await authService.getMe(req.user._id);
  return sendSuccess(res, 200, 'Lấy thông tin người dùng thành công', data);
}

async function updateMe(req, res) {
  const data = await authService.updateMe(req.user._id, req.body);
  return sendSuccess(res, 200, 'Cập nhật thông tin cá nhân thành công', data);
}

async function changePassword(req, res) {
  const data = await authService.changePassword(req.user._id, req.validatedBody);
  return sendSuccess(res, 200, 'Đổi mật khẩu thành công', data);
}

async function forgotPassword(req, res) {
  const data = await authService.forgotPassword(req.validatedBody || req.body);
  return sendSuccess(res, 200, 'Tạo mã OTP khôi phục mật khẩu thành công', data);
}

async function resetPassword(req, res) {
  const data = await authService.resetPassword(req.validatedBody || req.body);
  return sendSuccess(res, 200, 'Đặt lại mật khẩu thành công', data);
}

async function logout(req, res) {
  const data = await authService.logout();
  return sendSuccess(res, 200, 'Đăng xuất thành công', data);
}

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
  forgotPassword,
  resetPassword,
  logout
};

