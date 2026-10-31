const mongoose = require('mongoose');
const Order = require('../models/Order');

async function create(data, session = null) {
  const order = new Order(data);
  return order.save({ session });
}

async function findByUserId(userId, options = {}) {
  const { status, search } = options;
  const query = {
    userId: new mongoose.Types.ObjectId(userId)
  };

  if (status && status !== 'ALL') {
    query.status = status.toUpperCase();
  }

  if (search && search.trim()) {
    query.orderCode = { $regex: search.trim(), $options: 'i' };
  }

  return Order.find(query)
    .populate({
      path: 'voucherId',
      select: 'title coverImage thumbnail_url sellingPrice originalValue discountDisplay'
    })
    .populate({
      path: 'brandId',
      select: 'name code logo_url'
    })
    .populate({
      path: 'walletVoucherId',
      select: 'voucherCode is_used used_at expires_at'
    })
    .sort({ created_at: -1 });
}

async function findById(identifier, userId = null) {
  const query = {};
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    query._id = identifier;
  } else {
    query.orderCode = identifier.toUpperCase().trim();
  }

  if (userId) {
    query.userId = new mongoose.Types.ObjectId(userId);
  }

  return Order.findOne(query)
    .populate({
      path: 'voucherId',
      select: 'title description coverImage thumbnail_url sellingPrice originalValue discountDisplay termsAndConditions'
    })
    .populate({
      path: 'brandId',
      select: 'name code logo_url rating'
    })
    .populate({
      path: 'walletVoucherId',
      select: 'voucherCode is_used used_at expires_at'
    });
}

async function findAll(filter = {}, pagination = {}) {
  const { page = 1, limit = 20 } = pagination;
  const skip = (page - 1) * limit;

  const query = {};
  if (filter.brandId) {
    query.brandId = new mongoose.Types.ObjectId(filter.brandId);
  }
  if (filter.status && filter.status !== 'ALL') {
    query.status = filter.status.toUpperCase();
  }
  if (filter.search && filter.search.trim()) {
    query.orderCode = { $regex: filter.search.trim(), $options: 'i' };
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate({
        path: 'userId',
        select: 'full_name email phone avatar_url'
      })
      .populate({
        path: 'voucherId',
        select: 'title coverImage thumbnail_url sellingPrice discountDisplay'
      })
      .populate({
        path: 'brandId',
        select: 'name code logo_url'
      })
      .populate({
        path: 'walletVoucherId',
        select: 'voucherCode is_used used_at expires_at'
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(query)
  ]);

  return {
    orders,
    total,
    page: Number(page),
    limit: Number(limit)
  };
}

async function countOrders(filter = {}) {
  const query = {};
  if (filter.brandId) {
    query.brandId = new mongoose.Types.ObjectId(filter.brandId);
  }
  if (filter.status) {
    query.status = filter.status;
  }
  return Order.countDocuments(query);
}

async function sumRevenue(filter = {}) {
  const match = { status: 'PAID' };
  if (filter.brandId) {
    match.brandId = new mongoose.Types.ObjectId(filter.brandId);
  }

  const result = await Order.aggregate([
    { $match: match },
    { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
  ]);

  return result.length > 0 ? result[0].totalRevenue : 0;
}

module.exports = {
  create,
  findByUserId,
  findById,
  findAll,
  countOrders,
  sumRevenue
};
