const brandRepository = require('../repositories/brandRepository');
const userRepository = require('../repositories/userRepository');
const ApiError = require('../utils/ApiError');

async function getAllBrands(currentUserId = null) {
  const brands = await brandRepository.findAllWithActiveVoucherCount();

  let favoriteBrandIdsSet = new Set();
  if (currentUserId) {
    const favoriteBrandIds = await userRepository.getFavoriteBrandIds(currentUserId);
    favoriteBrandIdsSet = new Set(favoriteBrandIds.map((id) => id.toString()));
  }

  return brands.map((b) => ({
    _id: b._id,
    name: b.name,
    code: b.code,
    rating: b.rating || 4.8,
    logo_url: b.logo_url || '',
    cover_image_url: b.cover_image_url || '',
    description: b.description || '',
    categoryName: b.categoryName || 'General',
    categoryId: b.categoryId || null,
    activeVouchersCount: b.activeVouchersCount || 0,
    isFavorite: favoriteBrandIdsSet.has(b._id.toString())
  }));
}

async function getBrandById(id, currentUserId = null) {
  const brand = await brandRepository.findById(id);
  if (!brand || brand.status !== 'active') {
    throw new ApiError(404, 'Không tìm thấy thương hiệu');
  }

  let isFavorite = false;
  if (currentUserId) {
    const favoriteBrandIds = await userRepository.getFavoriteBrandIds(currentUserId);
    isFavorite = favoriteBrandIds.some((favId) => favId.toString() === brand._id.toString());
  }

  return {
    _id: brand._id,
    name: brand.name,
    code: brand.code,
    rating: brand.rating || 4.8,
    logo_url: brand.logo_url || '',
    cover_image_url: brand.cover_image_url || '',
    description: brand.description || '',
    category: brand.categoryId ? brand.categoryId.name : 'General',
    isFavorite: isFavorite
  };
}

async function createBrand(payload) {
  const code = (payload.code || '').toUpperCase().trim();
  if (code.length !== 2) {
    throw new ApiError(400, 'Mã thương hiệu (code) phải bao gồm đúng 2 ký tự viết hoa');
  }

  const existing = await brandRepository.findByCode(code);
  if (existing) {
    throw new ApiError(409, `Mã thương hiệu "${code}" đã tồn tại trên hệ thống`);
  }

  const brand = await brandRepository.create({
    name: payload.name.trim(),
    code: code,
    categoryId: payload.categoryId || null,
    rating: payload.rating || 4.8,
    logo_url: payload.logo_url || '',
    cover_image_url: payload.cover_image_url || '',
    description: payload.description || '',
    status: 'active'
  });

  return brand;
}

module.exports = {
  getAllBrands,
  getBrandById,
  createBrand
};
