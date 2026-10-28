const categoryService = require('../services/categoryService');
const { sendSuccess } = require('../utils/apiResponse');

async function getCategories(req, res) {
  const categories = await categoryService.getAllCategories();
  return sendSuccess(res, 200, 'Lấy danh sách danh mục thành công', categories);
}

module.exports = {
  getCategories
};
