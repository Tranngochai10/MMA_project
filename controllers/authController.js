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

async function changePassword(req, res) {
  const data = await authService.changePassword(req.user._id, req.validatedBody);
  return sendSuccess(res, 200, 'Đổi mật khẩu thành công', data);
}

async function logout(req, res) {
  const data = await authService.logout();
  return sendSuccess(res, 200, 'Đăng xuất thành công', data);
}

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  logout
};
