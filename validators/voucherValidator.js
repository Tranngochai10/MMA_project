const ApiError = require('../utils/ApiError');

function validateVoucher(data) {
  const fail = message => { throw new ApiError(400, message); };
  if (typeof data.title !== 'string' || !data.title.trim()) fail('Voucher title is required.');
  for (const key of ['sellingPrice', 'originalValue', 'discountValue', 'totalQuantity']) {
    if (data[key] === null || data[key] === '' || !Number.isFinite(Number(data[key]))) fail(`${key} must be a finite number.`);
  }
  if (Number(data.sellingPrice) <= 0 || Number(data.originalValue) <= 0) fail('Prices must be greater than zero.');
  if (!Number.isSafeInteger(Number(data.sellingPrice)) || !Number.isSafeInteger(Number(data.originalValue))) fail('Prices must be whole VND amounts.');
  if (Number(data.sellingPrice) > Number(data.originalValue)) fail('Selling price cannot exceed original value.');
  if (!Number.isSafeInteger(Number(data.totalQuantity)) || Number(data.totalQuantity) < 1) fail('Quantity must be a positive integer.');
  if (!['PERCENTAGE', 'FIXED'].includes(data.discountType)) fail('Invalid discount type.');
  if (Number(data.discountValue) < 0 || (data.discountType === 'PERCENTAGE' && Number(data.discountValue) > 100)) fail('Invalid discount value.');
  const start = new Date(data.startDate);
  const end = new Date(data.expirationDate);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start >= end) fail('Expiration date must be later than start date.');
}

module.exports = { validateVoucher };
module.exports.voucherImageUrl = function voucherImageUrl(value) {
  if (value === undefined || value === '') return '';
  if (typeof value !== 'string') throw new ApiError(400, 'Invalid voucher image.');
  const uri = value.trim();
  if (uri && !/^https?:\/\/\S+$/i.test(uri)) throw new ApiError(400, 'Upload the image before saving the voucher.');
  return uri;
};
