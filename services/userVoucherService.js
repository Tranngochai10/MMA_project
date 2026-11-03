const userVoucherRepository = require('../repositories/userVoucherRepository');
const ApiError = require('../utils/ApiError');

async function getMyWalletVouchers(userId, status = 'all') {
  const userVouchers = await userVoucherRepository.findByUserId(userId, status);
  const now = new Date();

  return userVouchers.map((uv) => {
    const voucher = uv.voucherId || {};
    const brand = voucher.brandId || {};
    const snapshot = uv.snapshot;

    let statusKey = 'AVAILABLE';
    let statusText = 'Khả dụng';

    if (uv.is_used) {
      statusKey = 'REDEEMED';
      statusText = 'Đã dùng';
    } else if (new Date(uv.expires_at) <= now) {
      statusKey = 'EXPIRED';
      statusText = 'Hết hạn';
    }

    return {
      _id: uv._id,
      voucherId: voucher._id || null,
      voucherCode: uv.voucherCode,
      orderCode: uv.orderCode || '',
      title: snapshot?.title ?? (voucher.title || 'Ưu đãi voucher'),
      brandName: snapshot?.brandName ?? (brand.name || 'Thương hiệu'),
      brandLogo: snapshot?.brandLogo ?? (brand.logo_url || ''),
      discountDisplay: snapshot?.discountDisplay ?? (voucher.discountDisplay || 'Ưu đãi'),
      sellingPrice: snapshot?.sellingPrice ?? (voucher.sellingPrice || 0),
      originalValue: snapshot?.originalValue ?? (voucher.originalValue || 0),
      coverImage: snapshot?.coverImage ?? (voucher.coverImage || voucher.thumbnail_url || ''),
      termsAndConditions: snapshot?.termsAndConditions ?? (voucher.termsAndConditions || []),
      status: statusKey,
      statusText: statusText,
      isUsed: uv.is_used,
      usedAt: uv.used_at ? uv.used_at.toISOString() : null,
      expirationDate: uv.expires_at ? uv.expires_at.toISOString() : null,
      purchasedDate: uv.purchased_at ? uv.purchased_at.toISOString() : null
    };
  });
}

/**
 * Mô phỏng người dùng bấm sử dụng voucher ngay trên ứng dụng
 */
async function useVoucher() { throw new ApiError(403, 'Please show the voucher QR to a manager for redemption.'); }

async function getWalletVoucherById(identifier, userId) {
  if (!identifier) {
    throw new ApiError(400, 'Mã voucher hoặc ID không được để trống');
  }

  const userVoucher = await userVoucherRepository.findByIdOrCode(identifier);
  if (!userVoucher) {
    throw new ApiError(404, 'Không tìm thấy voucher trong ví');
  }

  const ownerId = userVoucher.userId._id
    ? userVoucher.userId._id.toString()
    : userVoucher.userId.toString();

  if (ownerId !== userId.toString()) {
    throw new ApiError(403, 'Bạn không có quyền truy cập voucher này');
  }

  const voucher = userVoucher.voucherId || {};
  const brand = voucher.brandId || {};
  const now = new Date();

  let statusKey = 'AVAILABLE';
  let statusText = 'Khả dụng';

  if (userVoucher.is_used) {
    statusKey = 'REDEEMED';
    statusText = 'Đã dùng';
  } else if (new Date(userVoucher.expires_at) <= now) {
    statusKey = 'EXPIRED';
    statusText = 'Hết hạn';
  }

  const snapshot = userVoucher.snapshot;
  const conditions = snapshot?.termsAndConditions || (Array.isArray(voucher.termsAndConditions) && voucher.termsAndConditions.length
    ? voucher.termsAndConditions
    : Array.isArray(voucher.usageConditions) && voucher.usageConditions.length
    ? voucher.usageConditions
    : ['Áp dụng quy định đổi voucher tiêu chuẩn của thương hiệu.']);

  return {
    _id: userVoucher._id,
    id: userVoucher._id.toString(),
    voucherId: voucher._id || null,
    voucherCode: userVoucher.voucherCode,
    orderCode: userVoucher.orderCode || '',
    title: snapshot?.title ?? (voucher.title || 'Ưu đãi voucher'),
    brandName: snapshot?.brandName ?? (brand.name || 'Thương hiệu'),
    brandLogo: snapshot?.brandLogo ?? (brand.logo_url || ''),
    discountDisplay: snapshot?.discountDisplay ?? (voucher.discountDisplay || 'Ưu đãi'),
    sellingPrice: snapshot?.sellingPrice ?? (voucher.sellingPrice || 0),
    originalValue: snapshot?.originalValue ?? (voucher.originalValue || 0),
    coverImage: snapshot?.coverImage ?? (voucher.coverImage || voucher.thumbnail_url || ''),
    usageConditions: conditions,
    termsAndConditions: conditions,
    status: statusKey,
    statusText: statusText,
    isUsed: userVoucher.is_used,
    usedAt: userVoucher.used_at ? userVoucher.used_at.toISOString() : null,
    redeemedDate: userVoucher.used_at ? userVoucher.used_at.toISOString() : null,
    expirationDate: userVoucher.expires_at ? userVoucher.expires_at.toISOString() : null,
    purchasedDate: userVoucher.purchased_at ? userVoucher.purchased_at.toISOString() : null
  };
}

module.exports = {
  getMyWalletVouchers,
  getWalletVoucherById,
  useVoucher
};
