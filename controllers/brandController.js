const brandService = require('../services/brandService');
const { sendSuccess } = require('../utils/apiResponse');

async function getBrands(req, res) {
  const currentUserId = req.user ? req.user._id : null;
  const brands = await brandService.getAllBrands(currentUserId);
  return sendSuccess(res, 200, 'Lấy danh sách thương hiệu nổi bật thành công', brands);
}

async function getBrandById(req, res) {
  const currentUserId = req.user ? req.user._id : null;
  const brand = await brandService.getBrandById(req.params.id, currentUserId);
  return sendSuccess(res, 200, 'Lấy chi tiết thương hiệu thành công', brand);
}

async function createBrand(req, res) {
  const brand = await brandService.createBrand(req.body);
  return sendSuccess(res, 201, 'Tạo thương hiệu mới thành công', brand);
}

module.exports = {
  getBrands,
  getBrandById,
  createBrand
};
