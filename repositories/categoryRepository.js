const Category = require('../models/Category');

async function findAllActive() {
  return Category.find({ status: 'active' }).sort({ order: 1, name: 1 });
}

async function findById(id) {
  return Category.findById(id);
}

async function findBySlug(slug) {
  return Category.findOne({ slug: slug.toLowerCase().trim() });
}

async function create(data) {
  const category = new Category(data);
  return category.save();
}

module.exports = {
  findAllActive,
  findById,
  findBySlug,
  create
};
