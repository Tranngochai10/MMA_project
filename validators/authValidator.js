const ApiError = require('../utils/ApiError');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getString(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

function validateRegister(req, res, next) {
  const errors = [];
  const body = req.body || {};
  const fullName = getString(body.full_name);
  const email = getString(body.email).toLowerCase();
  const password = getString(body.password);
  const phone = getString(body.phone || body.phone_number);

  if (!fullName) {
    errors.push({ field: 'full_name', message: 'Họ và tên là bắt buộc' });
  }

  if (!email) {
    errors.push({ field: 'email', message: 'Email là bắt buộc' });
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.push({ field: 'email', message: 'Định dạng email không hợp lệ' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Mật khẩu là bắt buộc' });
  } else if (password.length < 6) {
    errors.push({ field: 'password', message: 'Mật khẩu phải chứa ít nhất 6 ký tự' });
  }

  if (errors.length) {
    return next(new ApiError(400, 'Dữ liệu không hợp lệ', errors));
  }

  req.validatedBody = {
    full_name: fullName,
    email: email,
    password: password,
    phone: phone
  };

  return next();
}

function validateLogin(req, res, next) {
  const errors = [];
  const body = req.body || {};
  const email = getString(body.email).toLowerCase();
  const password = getString(body.password);

  if (!email) {
    errors.push({ field: 'email', message: 'Email là bắt buộc' });
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.push({ field: 'email', message: 'Định dạng email không hợp lệ' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Mật khẩu là bắt buộc' });
  }

  if (errors.length) {
    return next(new ApiError(400, 'Dữ liệu không hợp lệ', errors));
  }

  req.validatedBody = {
    email: email,
    password: password
  };

  return next();
}

function validateChangePassword(req, res, next) {
  const errors = [];
  const body = req.body || {};
  const currentPassword = getString(body.current_password);
  const newPassword = getString(body.new_password);

  if (!currentPassword) {
    errors.push({ field: 'current_password', message: 'Mật khẩu hiện tại là bắt buộc' });
  }

  if (!newPassword) {
    errors.push({ field: 'new_password', message: 'Mật khẩu mới là bắt buộc' });
  } else if (newPassword.length < 6) {
    errors.push({ field: 'new_password', message: 'Mật khẩu mới phải chứa ít nhất 6 ký tự' });
  }

  if (errors.length) {
    return next(new ApiError(400, 'Dữ liệu không hợp lệ', errors));
  }

  req.validatedBody = {
    current_password: currentPassword,
    new_password: newPassword
  };

  return next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateChangePassword
};
