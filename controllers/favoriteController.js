const favoriteService = require('../services/favoriteService');
const { sendSuccess } = require('../utils/apiResponse');

async function getFavoriteBrands(req, res) {
  const brands = await favoriteService.getFavoriteBrands(req.user._id);
  return sendSuccess(res, 200, 'Lấy danh sách thương hiệu yêu thích thành công', brands);
}

async function toggleFavoriteBrand(req, res) {
  const result = await favoriteService.toggleFavoriteBrand(req.user._id, req.params.id);
  return sendSuccess(res, 200, result.message, result);
}

async function getFavoriteVouchers(req, res) {
  const vouchers = await favoriteService.getFavoriteVouchers(req.user._id);
  return sendSuccess(res, 200, 'Lấy danh sách voucher yêu thích thành công', vouchers);
}

async function toggleFavoriteVoucher(req, res) {
  const result = await favoriteService.toggleFavoriteVoucher(req.user._id, req.params.id);
  return sendSuccess(res, 200, result.message, result);
}

module.exports = {
  getFavoriteBrands,
  toggleFavoriteBrand,
  getFavoriteVouchers,
  toggleFavoriteVoucher
};
