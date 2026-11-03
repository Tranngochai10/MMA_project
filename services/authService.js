const ApiError = require('../utils/ApiError');
const { comparePassword, hashPassword } = require('../utils/password');
const { signAuthToken } = require('../utils/jwt');
const userRepository = require('../repositories/userRepository');
function sanitizeUser(user) {
  const plainUser = typeof user.toObject === 'function' ? user.toObject() : Object.assign({}, user);
  delete plainUser.password;
  delete plainUser.resetOtp;
  delete plainUser.resetOtpHash;
  delete plainUser.resetOtpExpires;
  delete plainUser.resetOtpAttempts;
  delete plainUser.tokenVersion;
  return plainUser;
}

function buildAuthResponse(user) {
  const token = signAuthToken({
    user_id: user._id.toString(),
    role: user.role,
    token_version: user.tokenVersion || 0
  });

  return {
    token: token,
    expires_in: process.env.JWT_EXPIRES_IN || '7d'
  };
}

async function register(payload) {
  const existingUser = await userRepository.findByEmail(payload.email);

  if (existingUser) {
    throw new ApiError(409, 'Email đã được đăng ký trên hệ thống');
  }

  const hashedPassword = await hashPassword(payload.password);

  const user = await userRepository.createUser({
    full_name: payload.full_name,
    email: payload.email,
    password: hashedPassword,
    phone: payload.phone || '',
    role: 'USER',
    avatar_url: payload.avatar_url || '',
    status: 'active'
  });

  return buildAuthResponse(user);
}

async function login(payload) {
  const user = await userRepository.findByEmailWithPassword(payload.email);

  if (!user) {
    throw new ApiError(401, 'Email hoặc mật khẩu không chính xác');
  }

  const passwordMatches = await comparePassword(payload.password, user.password);

  if (!passwordMatches) {
    throw new ApiError(401, 'Email hoặc mật khẩu không chính xác');
  }

  if (user.status === 'blocked') {
    throw new ApiError(403, 'Tài khoản của bạn đã bị khóa');
  }

  return buildAuthResponse(user);
}

async function getMe(userId) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new ApiError(404, 'Không tìm thấy người dùng');
  }

  return {
    user: sanitizeUser(user)
  };
}

async function changePassword(userId, payload) {
  const user = await userRepository.findByIdWithPassword(userId);

  if (!user) {
    throw new ApiError(404, 'Không tìm thấy người dùng');
  }

  const passwordMatches = await comparePassword(payload.current_password, user.password);

  if (!passwordMatches) {
    throw new ApiError(400, 'Mật khẩu hiện tại không chính xác');
  }

  const hashedPassword = await hashPassword(payload.new_password);
  await userRepository.setPasswordAndRevoke(user._id, hashedPassword);

  return {
    success: true,
    message: 'Đổi mật khẩu thành công'
  };
}

async function logout(userId) {
  await userRepository.revokeSessions(userId);
  return {
    logged_out: true
  };
}

async function updateMe(userId, payload) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Không tìm thấy người dùng');
  }

  const updateFields = {};
  if (payload.full_name !== undefined) updateFields.full_name = payload.full_name.trim();
  if (payload.phone !== undefined) updateFields.phone = payload.phone.trim();
  if (payload.avatar_url !== undefined) updateFields.avatar_url = payload.avatar_url.trim();

  if (payload.email && payload.email.toLowerCase().trim() !== user.email) {
    const existing = await userRepository.findByEmail(payload.email);
    if (existing && existing._id.toString() !== userId.toString()) {
      throw new ApiError(409, 'Email này đã được sử dụng bởi tài khoản khác');
    }
    updateFields.email = payload.email.toLowerCase().trim();
  }

  const updatedUser = await userRepository.updateById(userId, updateFields);
  return {
    user: sanitizeUser(updatedUser)
  };
}

async function forgotPassword() { throw new ApiError(503, 'Password recovery email delivery is not configured.'); }

async function resetPassword() { throw new ApiError(503, 'Password recovery email delivery is not configured.'); }

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
