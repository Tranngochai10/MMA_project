const userVoucherRepository = require('../repositories/userVoucherRepository');
const ApiError = require('../utils/ApiError');

async function getMyWalletVouchers(userId, status = 'all') {
  const userVouchers = await userVoucherRepository.findByUserId(userId, status);
  const now = new Date();

  return userVouchers.map((uv) => {
    const voucher = uv.voucherId || {};
    const brand = voucher.brandId || {};

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
      title: voucher.title || 'Ưu đãi voucher',
      brandName: brand.name || 'Thương hiệu',
      brandLogo: brand.logo_url || '',
      discountDisplay: voucher.discountDisplay || 'Ưu đãi',
      sellingPrice: uv.totalAmount || voucher.sellingPrice || 0,
      originalValue: voucher.originalValue || 0,
      coverImage: voucher.coverImage || voucher.thumbnail_url || '',
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
async function useVoucher(identifier, userId) {
  if (!identifier) {
    throw new ApiError(400, 'Mã voucher hoặc ID không được để trống');
  }

  // 1. Tìm bản ghi trong UserVoucher theo ID hoặc voucherCode
  const userVoucher = await userVoucherRepository.findByIdOrCode(identifier);
  if (!userVoucher) {
    throw new ApiError(404, 'Không tìm thấy voucher trong ví');
  }

  // 2. Kiểm tra quyền sở hữu
  const ownerId = userVoucher.userId._id
    ? userVoucher.userId._id.toString()
    : userVoucher.userId.toString();

  if (ownerId !== userId.toString()) {
    throw new ApiError(403, 'Bạn không có quyền sử dụng voucher này');
  }

  // 3. Kiểm tra trạng thái đã dùng
  if (userVoucher.is_used) {
    throw new ApiError(400, 'Voucher này đã được sử dụng trước đó');
  }

  // 4. Kiểm tra thời hạn
  const now = new Date();
  if (new Date(userVoucher.expires_at) <= now) {
    throw new ApiError(400, 'Voucher đã hết hạn sử dụng');
  }

  // 5. Cập nhật is_used = true, used_at = now
  const updated = await userVoucherRepository.markAsUsed(userVoucher._id, now);
  const voucher = updated.voucherId || {};
  const brand = voucher.brandId || {};

  return {
    _id: updated._id,
    voucherId: voucher._id || null,
    voucherCode: updated.voucherCode,
    orderCode: updated.orderCode || '',
    title: voucher.title || 'Ưu đãi voucher',
    brandName: brand.name || 'Thương hiệu',
    brandLogo: brand.logo_url || '',
    discountDisplay: voucher.discountDisplay || 'Ưu đãi',
    status: 'USED',
    statusText: 'Đã dùng',
    isUsed: true,
    usedAt: now.toISOString(),
    expirationDate: updated.expires_at ? updated.expires_at.toISOString() : null,
    purchasedDate: updated.purchased_at ? updated.purchased_at.toISOString() : null
  };
}

module.exports = {
  getMyWalletVouchers,
  useVoucher
};
