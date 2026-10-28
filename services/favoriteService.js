const userRepository = require('../repositories/userRepository');
const brandRepository = require('../repositories/brandRepository');
const voucherRepository = require('../repositories/voucherRepository');
const ApiError = require('../utils/ApiError');

async function getFavoriteBrands(userId) {
  const favoriteBrandIds = await userRepository.getFavoriteBrandIds(userId);
  if (!favoriteBrandIds || !favoriteBrandIds.length) {
    return [];
  }

  const brands = await brandRepository.findByIds(favoriteBrandIds);
  return brands;
}

async function toggleFavoriteBrand(userId, brandId) {
  const brand = await brandRepository.findById(brandId);
  if (!brand) {
    throw new ApiError(404, 'Không tìm thấy thương hiệu');
  }

  const result = await userRepository.toggleFavoriteBrand(userId, brandId);
  return {
    brandId: brandId,
    isFavorite: result.isFavorite,
    message: result.isFavorite
      ? 'Đã thêm thương hiệu vào mục yêu thích'
      : 'Đã xóa thương hiệu khỏi mục yêu thích'
  };
}

async function getFavoriteVouchers(userId) {
  const favoriteVoucherIds = await userRepository.getFavoriteVoucherIds(userId);
  if (!favoriteVoucherIds || !favoriteVoucherIds.length) {
    return [];
  }

  const vouchers = await voucherRepository.findByIds(favoriteVoucherIds);
  return vouchers.map((v) => ({
    _id: v._id,
    title: v.title,
    brand: {
      _id: v.brandId ? v.brandId._id : null,
      name: v.brandId ? v.brandId.name : '',
      logo_url: v.brandId ? v.brandId.logo_url : ''
    },
    category: v.categoryId ? v.categoryId.name : 'General',
    discountPercent: v.discountValue,
    discountDisplay: v.discountDisplay || `${v.discountValue}% OFF`,
    sellingPrice: v.sellingPrice,
    originalValue: v.originalValue,
    expirationDate: v.expirationDate,
    thumbnail_url: v.thumbnail_url || v.coverImage || '',
    isFavorite: true
  }));
}

async function toggleFavoriteVoucher(userId, voucherId) {
  const voucher = await voucherRepository.findById(voucherId);
  if (!voucher) {
    throw new ApiError(404, 'Không tìm thấy voucher');
  }

  const result = await userRepository.toggleFavoriteVoucher(userId, voucherId);
  return {
    voucherId: voucherId,
    isFavorite: result.isFavorite,
    message: result.isFavorite
      ? 'Đã thêm voucher vào mục yêu thích'
      : 'Đã xóa voucher khỏi mục yêu thích'
  };
}

module.exports = {
  getFavoriteBrands,
  toggleFavoriteBrand,
  getFavoriteVouchers,
  toggleFavoriteVoucher
};
