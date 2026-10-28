const mongoose = require('mongoose');
const UserVoucher = require('../models/UserVoucher');

async function create(data, session = null) {
  const userVoucher = new UserVoucher(data);
  return userVoucher.save({ session });
}

async function findByUserId(userId, status = 'all') {
  const now = new Date();
  const query = {
    userId: new mongoose.Types.ObjectId(userId)
  };

  if (status === 'available') {
    query.is_used = false;
    query.expires_at = { $gt: now };
  } else if (status === 'used') {
    query.is_used = true;
  } else if (status === 'expired') {
    query.is_used = false;
    query.expires_at = { $lte: now };
  }

  return UserVoucher.find(query)
    .populate({
      path: 'voucherId',
      select: 'title description discountType discountValue discountDisplay sellingPrice originalValue thumbnail_url coverImage usageConditions termsAndConditions brandId categoryId',
      populate: [
        { path: 'brandId', select: 'name code logo_url' },
        { path: 'categoryId', select: 'name slug icon' }
      ]
    })
    .sort({ purchased_at: -1 });
}

async function findByCode(voucherCode, session = null) {
  const query = UserVoucher.findOne({ voucherCode: voucherCode.toUpperCase().trim() })
    .populate({
      path: 'voucherId',
      select: 'title description discountDisplay sellingPrice originalValue coverImage thumbnail_url brandId categoryId',
      populate: { path: 'brandId', select: 'name code logo_url' }
    });

  if (session) {
    query.session(session);
  }

  return query;
}

async function findByIdOrCode(identifier, session = null) {
  if (!identifier) return null;

  let query;
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    query = UserVoucher.findById(identifier).populate({
      path: 'voucherId',
      select: 'title description discountDisplay sellingPrice originalValue coverImage thumbnail_url brandId categoryId',
      populate: { path: 'brandId', select: 'name code logo_url' }
    });
  } else {
    query = UserVoucher.findOne({ voucherCode: identifier.toUpperCase().trim() }).populate({
      path: 'voucherId',
      select: 'title description discountDisplay sellingPrice originalValue coverImage thumbnail_url brandId categoryId',
      populate: { path: 'brandId', select: 'name code logo_url' }
    });
  }

  if (session) {
    query.session(session);
  }

  return query;
}

async function markAsUsed(id, usedAt = new Date()) {
  return UserVoucher.findByIdAndUpdate(
    id,
    {
      is_used: true,
      used_at: usedAt
    },
    { returnDocument: 'after' }
  ).populate({
    path: 'voucherId',
    select: 'title description discountDisplay sellingPrice originalValue coverImage thumbnail_url brandId categoryId',
    populate: { path: 'brandId', select: 'name code logo_url' }
  });
}

/**
 * Thống kê top các danh mục mà user đã mua nhiều nhất
 */
async function getTopCategoryIdsByUserId(userId, limit = 3) {
  const result = await UserVoucher.aggregate([
    {
      $match: { userId: new mongoose.Types.ObjectId(userId) }
    },
    {
      $lookup: {
        from: 'vouchers',
        localField: 'voucherId',
        foreignField: '_id',
        as: 'voucher'
      }
    },
    {
      $unwind: '$voucher'
    },
    {
      $group: {
        _id: '$voucher.categoryId',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limit
    }
  ]);

  return result.map((item) => item._id);
}

module.exports = {
  create,
  findByUserId,
  findByCode,
  findByIdOrCode,
  markAsUsed,
  getTopCategoryIdsByUserId
};
