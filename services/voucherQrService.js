const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const UserVoucher = require('../models/UserVoucher');
const ApiError = require('../utils/ApiError');
const PREFIX = 'DLQR:';
function decodeRedemption(value) {
  if (typeof value !== 'string') throw new ApiError(400, 'Mã voucher không hợp lệ.');
  if (!value.startsWith(PREFIX)) return value.trim().toUpperCase();
  try {
    const payload = jwt.verify(value.slice(PREFIX.length), process.env.JWT_SECRET, { algorithms: ['HS256'], audience: 'voucher-redemption' });
    if (payload.purpose !== 'redeem' || typeof payload.voucherCode !== 'string') throw new Error();
    return payload.voucherCode;
  } catch {
    throw new ApiError(400, 'QR không hợp lệ hoặc đã hết hạn. Hãy tạo mã mới.');
  }
}
async function createQr(id, userId) {
  if (!require('mongoose').isValidObjectId(id)) throw new ApiError(400, 'Mã voucher không hợp lệ.');
  const voucher = await UserVoucher.findOne({ _id: id, userId });
  if (!voucher) throw new ApiError(404, 'Không tìm thấy voucher trong ví.');
  if (voucher.is_used || new Date(voucher.expires_at) <= new Date()) throw new ApiError(409, 'Voucher đã dùng hoặc hết hạn.');
  if (!process.env.JWT_SECRET) throw new ApiError(503, 'Chưa cấu hình ký mã QR.');
  const seconds = Math.min(300, Math.floor((new Date(voucher.expires_at).getTime() - Date.now()) / 1000));
  if (seconds <= 0) throw new ApiError(409, 'Voucher đã hết hạn.');
  const token = jwt.sign({ purpose: 'redeem', voucherCode: voucher.voucherCode }, process.env.JWT_SECRET,
    { algorithm: 'HS256', audience: 'voucher-redemption', expiresIn: seconds });
  return { qrImage: await QRCode.toDataURL(PREFIX + token, { width: 512, margin: 3 }), expiresAt: new Date(Date.now() + seconds * 1000).toISOString() };
}
module.exports = { createQr, decodeRedemption };
