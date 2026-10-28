const { verifyAuthToken } = require('../utils/jwt');
const userRepository = require('../repositories/userRepository');

async function optionalAuthenticate(req, res, next) {
  try {
    const authorization = req.headers.authorization || '';
    const parts = authorization.split(' ');

    if (parts.length === 2 && parts[0] === 'Bearer' && parts[1]) {
      const payload = verifyAuthToken(parts[1]);
      const user = await userRepository.findById(payload.user_id);
      if (user) {
        req.auth = payload;
        req.user = user;
        req.token = parts[1];
      }
    }
  } catch {
    // Token không hợp lệ hoặc hết hạn thì bỏ qua, coi như khách vãng lai
  }
  return next();
}

module.exports = optionalAuthenticate;
