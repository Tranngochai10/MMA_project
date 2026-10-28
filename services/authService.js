const ApiError = require('../utils/ApiError');
const { comparePassword, hashPassword } = require('../utils/password');
const { signAuthToken } = require('../utils/jwt');
const userRepository = require('../repositories/userRepository');

function sanitizeUser(user) {
  const plainUser = typeof user.toObject === 'function' ? user.toObject() : Object.assign({}, user);
  delete plainUser.password;
  return plainUser;
}

function buildAuthResponse(user) {
  const token = signAuthToken({
    user_id: user._id.toString(),
    role: user.role
  });

  return {
    token: token,
    token_type: 'Bearer',
    expires_in: process.env.JWT_EXPIRES_IN || '7d',
    user: sanitizeUser(user)
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
    assignedBrandId: null,
    avatar_url: payload.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
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
  await userRepository.updateById(user._id, {
    password: hashedPassword
  });

  return {
    success: true,
    message: 'Đổi mật khẩu thành công'
  };
}

async function logout() {
  return {
    logged_out: true
  };
}

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  logout
};
