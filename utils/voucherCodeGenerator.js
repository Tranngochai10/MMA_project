const crypto = require('crypto');
const UserVoucher = require('../models/UserVoucher');
const ApiError = require('./ApiError');

/**
 * Sinh mã voucher độc nhất theo quy tắc: 2 chữ cái Brand + 6 số ngẫu nhiên (VD: SB184920)
 * @param {string} brandCode - Mã thương hiệu (2 chữ cái)
 * @param {object} [session] - Mongoose session nếu đang trong transaction
 * @returns {Promise<string>}
 */
async function generateUniqueVoucherCode(brandCode, session = null) {
  const prefix = (brandCode || 'VC').toUpperCase().trim().slice(0, 2);
  let isUnique = false;
  let code = '';
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    const randomSixDigits = crypto.randomInt(100000, 1000000).toString();
    code = `${prefix}${randomSixDigits}`;

    const query = UserVoucher.findOne({ voucherCode: code });
    if (session) {
      query.session(session);
    }
    const existing = await query;

    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new ApiError(500, 'Không thể sinh mã voucher duy nhất, vui lòng thử lại');
  }

  return code;
}

/**
 * Sinh mã đơn hàng giao dịch (VD: ORD-94821)
 * @returns {string}
 */
function generateOrderCode() {
  const randomNum = crypto.randomInt(10000, 100000);
  return `ORD-${randomNum}`;
}

module.exports = {
  generateUniqueVoucherCode,
  generateOrderCode
};
