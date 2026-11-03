const { brandPresence } = require('../utils/brandPresence');
const { resolveVoucherImage } = require('../utils/voucherMedia');
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
    description: v.description || '',
    brand: {
      _id: v.brandId ? v.brandId._id : null,
      name: v.brandId ? v.brandId.name : '',
      logo_url: v.brandId ? v.brandId.logo_url : '',
      cover_image_url: v.brandId ? v.brandId.cover_image_url : '',
      ...brandPresence(v.brandId || {}),
      address: v.brandId ? v.brandId.address || '' : '',
      rating: v.brandId ? v.brandId.rating : null
    },
    category: v.categoryId ? v.categoryId.name : 'General',
    categoryId: v.categoryId ? v.categoryId._id : null,
    discountType: v.discountType,
    discountValue: v.discountValue,
    discountPercent: v.discountValue,
    discountDisplay: v.discountDisplay || `${v.discountValue}% OFF`,
    sellingPrice: v.sellingPrice,
    originalValue: v.originalValue,
    totalQuantity: v.totalQuantity,
    availableQuantity: v.availableQuantity,
    startDate: v.startDate,
    expirationDate: v.expirationDate,
    termsAndConditions: v.termsAndConditions || [],
    coverImage: resolveVoucherImage(v),
    thumbnail_url: resolveVoucherImage(v, true),
    status: v.status,
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
