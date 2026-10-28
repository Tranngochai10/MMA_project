const mongoose = require('mongoose');
const Voucher = require('../models/Voucher');

async function findWithFilters({
  categoryId,
  brandId,
  search,
  sort = 'discount_desc',
  limit = 20,
  page = 1
}) {
  const now = new Date();
  const query = {
    status: 'ACTIVE',
    expirationDate: { $gt: now },
    availableQuantity: { $gt: 0 }
  };

  if (categoryId) {
    query.categoryId = new mongoose.Types.ObjectId(categoryId);
  }

  if (brandId) {
    query.brandId = new mongoose.Types.ObjectId(brandId);
  }

  if (search && search.trim()) {
    query.title = { $regex: search.trim(), $options: 'i' };
  }

  let sortOption = { discountValue: -1, created_at: -1 };
  if (sort === 'newest') {
    sortOption = { created_at: -1 };
  } else if (sort === 'discount_desc') {
    sortOption = { discountValue: -1 };
  } else if (sort === 'price_asc') {
    sortOption = { sellingPrice: 1 };
  } else if (sort === 'price_desc') {
    sortOption = { sellingPrice: -1 };
  }

  const skip = (Math.max(1, page) - 1) * limit;

  const [vouchers, total] = await Promise.all([
    Voucher.find(query)
      .populate('brandId', 'name code logo_url rating')
      .populate('categoryId', 'name slug icon')
      .sort(sortOption)
      .skip(skip)
      .limit(limit),
    Voucher.countDocuments(query)
  ]);

  return { vouchers, total, page, limit };
}

async function findById(id, session = null) {
  const query = Voucher.findById(id)
    .populate('brandId', 'name code logo_url cover_image_url description rating')
    .populate('categoryId', 'name slug icon');

  if (session) {
    query.session(session);
  }

  return query;
}

async function findRecommended(topCategoryIds = [], limit = 10) {
  const now = new Date();
  const baseQuery = {
    status: 'ACTIVE',
    expirationDate: { $gt: now },
    availableQuantity: { $gt: 0 }
  };

  // Nếu user đã có sở thích danh mục
  if (topCategoryIds && topCategoryIds.length > 0) {
    const categoryObjectIds = topCategoryIds.map((id) => new mongoose.Types.ObjectId(id));
    const preferredVouchers = await Voucher.find({
      ...baseQuery,
      categoryId: { $in: categoryObjectIds }
    })
      .populate('brandId', 'name code logo_url rating')
      .populate('categoryId', 'name slug icon')
      .sort({ discountValue: -1, created_at: -1 })
      .limit(limit);

    if (preferredVouchers.length >= limit) {
      return preferredVouchers;
    }

    // Nếu chưa đủ số lượng, bù thêm voucher ưu đãi hot khác
    const excludeIds = preferredVouchers.map((v) => v._id);
    const remainingLimit = limit - preferredVouchers.length;

    const fillerVouchers = await Voucher.find({
      ...baseQuery,
      _id: { $nin: excludeIds }
    })
      .populate('brandId', 'name code logo_url rating')
      .populate('categoryId', 'name slug icon')
      .sort({ discountValue: -1, created_at: -1 })
      .limit(remainingLimit);

    return [...preferredVouchers, ...fillerVouchers];
  }

  // Fallback cho user mới: trả về voucher có discount cao nhất
  return Voucher.find(baseQuery)
    .populate('brandId', 'name code logo_url rating')
    .populate('categoryId', 'name slug icon')
    .sort({ discountValue: -1, created_at: -1 })
    .limit(limit);
}

async function findByIds(ids) {
  if (!ids || !ids.length) return [];
  const now = new Date();

  return Voucher.find({
    _id: { $in: ids },
    status: 'ACTIVE',
    expirationDate: { $gt: now }
  })
    .populate('brandId', 'name code logo_url rating')
    .populate('categoryId', 'name slug icon')
    .sort({ discountValue: -1 });
}

async function decrementAvailableQuantity(voucherId, session = null) {
  const now = new Date();
  const query = Voucher.findOneAndUpdate(
    {
      _id: voucherId,
      availableQuantity: { $gt: 0 },
      status: 'ACTIVE',
      expirationDate: { $gt: now }
    },
    { $inc: { availableQuantity: -1 } },
    { returnDocument: 'after' }
  );

  if (session) {
    query.session(session);
  }

  return query;
}

async function create(data, session = null) {
  const voucher = new Voucher(data);
  return voucher.save({ session });
}

module.exports = {
  findWithFilters,
  findById,
  findRecommended,
  findByIds,
  decrementAvailableQuantity,
  create
};
