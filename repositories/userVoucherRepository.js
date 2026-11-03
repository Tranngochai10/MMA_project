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
      select: 'title description discountDisplay sellingPrice originalValue coverImage thumbnail_url termsAndConditions usageConditions brandId categoryId',
      populate: { path: 'brandId', select: 'name code logo_url' }
    });
  } else {
    query = UserVoucher.findOne({ voucherCode: identifier.toUpperCase().trim() }).populate({
      path: 'voucherId',
      select: 'title description discountDisplay sellingPrice originalValue coverImage thumbnail_url termsAndConditions usageConditions brandId categoryId',
      populate: { path: 'brandId', select: 'name code logo_url' }
    });
  }

  if (session) {
    query.session(session);
  }

  return query;
}

async function markAsUsed(id, usedAt = new Date(), actorId = null, source = 'MANAGER') {
  return UserVoucher.findOneAndUpdate(
    { _id: id, is_used: false, expires_at: { $gt: usedAt } },
    {
      is_used: true,
      used_at: usedAt,
      redeemedBy: actorId,
      redemptionSource: source
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

async function findManagerRedemptions(filter = {}, pagination = {}) {
  const { page = 1, limit = 20 } = pagination;
  const skip = (page - 1) * limit;

  const matchStage = { is_used: true };

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $lookup: {
        from: 'vouchers',
        localField: 'voucherId',
        foreignField: '_id',
        as: 'voucher'
      }
    },
    { $unwind: '$voucher' },
    {
      $lookup: {
        from: 'brands',
        localField: 'voucher.brandId',
        foreignField: '_id',
        as: 'brand'
      }
    },
    { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } }
  ];

  if (filter.brandId) {
    pipeline.push({
      $match: {
        'voucher.brandId': new mongoose.Types.ObjectId(filter.brandId)
      }
    });
  }

  if (filter.search && filter.search.trim()) {
    const s = filter.search.trim();
    pipeline.push({
      $match: {
        $or: [
          { voucherCode: { $regex: s, $options: 'i' } },
          { 'user.full_name': { $regex: s, $options: 'i' } },
          { 'voucher.title': { $regex: s, $options: 'i' } }
        ]
      }
    });
  }

  const countPipeline = [...pipeline, { $count: 'total' }];

  pipeline.push({ $sort: { used_at: -1 } });
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: Number(limit) });

  const [redemptions, countResult] = await Promise.all([
    UserVoucher.aggregate(pipeline),
    UserVoucher.aggregate(countPipeline)
  ]);

  const total = countResult.length > 0 ? countResult[0].total : 0;
  return {
    redemptions,
    total,
    page: Number(page),
    limit: Number(limit)
  };
}

async function countRedemptions(filter = {}) {
  if (!filter.brandId) {
    return UserVoucher.countDocuments({ is_used: true });
  }

  const result = await UserVoucher.aggregate([
    { $match: { is_used: true } },
    {
      $lookup: {
        from: 'vouchers',
        localField: 'voucherId',
        foreignField: '_id',
        as: 'voucher'
      }
    },
    { $unwind: '$voucher' },
    {
      $match: {
        'voucher.brandId': new mongoose.Types.ObjectId(filter.brandId)
      }
    },
    { $count: 'total' }
  ]);

  return result.length > 0 ? result[0].total : 0;
}

async function countIssued(filter = {}) {
  if (!filter.brandId) {
    return UserVoucher.countDocuments();
  }

  const result = await UserVoucher.aggregate([
    {
      $lookup: {
        from: 'vouchers',
        localField: 'voucherId',
        foreignField: '_id',
        as: 'voucher'
      }
    },
    { $unwind: '$voucher' },
    {
      $match: {
        'voucher.brandId': new mongoose.Types.ObjectId(filter.brandId)
      }
    },
    { $count: 'total' }
  ]);

  return result.length > 0 ? result[0].total : 0;
}

module.exports = {
  create,
  findByUserId,
  findByCode,
  findByIdOrCode,
  markAsUsed,
  getTopCategoryIdsByUserId,
  findManagerRedemptions,
  countRedemptions,
  countIssued
};
