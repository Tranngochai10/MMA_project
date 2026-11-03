const { brandPresence } = require('../utils/brandPresence');
const { resolveVoucherImage } = require('../utils/voucherMedia');
const voucherRepository = require('../repositories/voucherRepository');
const userVoucherRepository = require('../repositories/userVoucherRepository');
const userRepository = require('../repositories/userRepository');
const ApiError = require('../utils/ApiError');

function formatVoucherCard(v, favoriteSet = new Set()) {
  return {
    _id: v._id,
    title: v.title,
    brand: {
      _id: v.brandId ? v.brandId._id : null,
      name: v.brandId ? v.brandId.name : '',
      code: v.brandId ? v.brandId.code : '',
      logo_url: v.brandId ? v.brandId.logo_url : '',
      ...brandPresence(v.brandId || {}),
      address: v.brandId ? v.brandId.address || '' : '',
      cover_image_url: v.brandId ? v.brandId.cover_image_url || '' : '',
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
    expirationDate: v.expirationDate,
    availableQuantity: v.availableQuantity,
    coverImage: resolveVoucherImage(v),
    thumbnail_url: resolveVoucherImage(v, true),
    isFavorite: favoriteSet.has(v._id.toString())
  };
}

async function getVouchers({
  categoryId,
  brandId,
  search,
  sort,
  recommended = false,
  page = 1,
  limit = 20,
  currentUserId = null
}) {
  let favoriteSet = new Set();
  if (currentUserId) {
    const favoriteVoucherIds = await userRepository.getFavoriteVoucherIds(currentUserId);
    favoriteSet = new Set(favoriteVoucherIds.map((id) => id.toString()));
  }

  // Nếu người dùng không truyền bộ lọc tìm kiếm nào và đang ở trang 1 -> Sử dụng gợi ý cá nhân hóa
  const hasSpecificFilter = categoryId || brandId || (search && search.trim()) || sort;

  if (recommended && !hasSpecificFilter && currentUserId && Number(page) === 1) {
    const topCategoryIds = await userVoucherRepository.getTopCategoryIdsByUserId(currentUserId, 3);
    const recommendedList = await voucherRepository.findRecommended(topCategoryIds, limit);
    return {
      vouchers: recommendedList.map((v) => formatVoucherCard(v, favoriteSet)),
      total: recommendedList.length,
      page: 1,
      limit: limit,
      isPersonalized: topCategoryIds.length > 0
    };
  }

  const { vouchers, total } = await voucherRepository.findWithFilters({
    categoryId,
    brandId,
    search,
    sort,
    page: Number(page),
    limit: Number(limit)
  });

  return {
    vouchers: vouchers.map((v) => formatVoucherCard(v, favoriteSet)),
    total,
    page: Number(page),
    limit: Number(limit)
  };
}

async function getVoucherById(id, currentUserId = null) {
  const voucher = await voucherRepository.findById(id);
  if (!voucher || voucher.status !== 'ACTIVE') {
    throw new ApiError(404, 'Không tìm thấy voucher hoặc ưu đãi đã kết thúc');
  }

  let isFavorite = false;
  if (currentUserId) {
    const favoriteVoucherIds = await userRepository.getFavoriteVoucherIds(currentUserId);
    isFavorite = favoriteVoucherIds.some((favId) => favId.toString() === voucher._id.toString());
  }

  return {
    _id: voucher._id,
    title: voucher.title,
    description: voucher.description || '',
    brand: {
      _id: voucher.brandId ? voucher.brandId._id : null,
      name: voucher.brandId ? voucher.brandId.name : '',
      code: voucher.brandId ? voucher.brandId.code : '',
      logo_url: voucher.brandId ? voucher.brandId.logo_url : '',
      ...brandPresence(voucher.brandId || {}),
      address: voucher.brandId ? voucher.brandId.address : '',
      cover_image_url: voucher.brandId ? voucher.brandId.cover_image_url : '',
      rating: voucher.brandId ? voucher.brandId.rating : null
    },
    status: voucher.status,
    categoryId: voucher.categoryId ? voucher.categoryId._id : null,
    category: voucher.categoryId ? voucher.categoryId.name : 'General',
    discountType: voucher.discountType,
    discountValue: voucher.discountValue,
    discountDisplay: voucher.discountDisplay || `${voucher.discountValue}% OFF`,
    sellingPrice: voucher.sellingPrice,
    originalValue: voucher.originalValue,
    totalQuantity: voucher.totalQuantity,
    availableQuantity: voucher.availableQuantity,
    startDate: voucher.startDate,
    expirationDate: voucher.expirationDate,
    termsAndConditions: voucher.termsAndConditions?.length
      ? voucher.termsAndConditions
      : ['Vui lòng xem điều kiện do thương hiệu công bố trước khi sử dụng voucher.'],
    coverImage: resolveVoucherImage(voucher),
    thumbnail_url: resolveVoucherImage(voucher, true),
    isFavorite: isFavorite
  };
}

async function buyVoucher(voucherId, userId, paymentMethod, requestKey) {
  return require('./paymentService').createTransferOrder(voucherId, userId, requestKey);
}
module.exports = { getVouchers, getVoucherById, buyVoucher };
