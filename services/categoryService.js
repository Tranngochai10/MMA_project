const categoryRepository = require('../repositories/categoryRepository');

async function getAllCategories() {
  const categories = await categoryRepository.findAllActive();
  return categories.map((cat) => ({
    _id: cat._id,
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon,
    order: cat.order
  }));
}

module.exports = {
  getAllCategories
};
