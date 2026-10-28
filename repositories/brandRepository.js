const mongoose = require('mongoose');
const Brand = require('../models/Brand');

async function findAllWithActiveVoucherCount() {
  const now = new Date();

  return Brand.aggregate([
    {
      $match: { status: 'active' }
    },
    // Lookup Category
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    {
      $unwind: {
        path: '$categoryInfo',
        preserveNullAndEmptyArrays: true
      }
    },
    // Lookup Active Vouchers
    {
      $lookup: {
        from: 'vouchers',
        let: { brandId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$brandId', '$$brandId'] },
                  { $eq: ['$status', 'ACTIVE'] },
                  { $gt: ['$expirationDate', now] },
                  { $gt: ['$availableQuantity', 0] }
                ]
              }
            }
          }
        ],
        as: 'activeVouchers'
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        code: 1,
        rating: { $ifNull: ['$rating', 4.8] },
        logo_url: 1,
        cover_image_url: 1,
        description: 1,
        status: 1,
        categoryId: 1,
        categoryName: { $ifNull: ['$categoryInfo.name', 'General'] },
        activeVouchersCount: { $size: '$activeVouchers' },
        created_at: 1
      }
    },
    {
      $sort: { rating: -1, name: 1 }
    }
  ]);
}

async function findById(id) {
  return Brand.findById(id).populate('categoryId', 'name slug icon');
}

async function findByCode(code) {
  return Brand.findOne({ code: code.toUpperCase().trim() });
}

async function findByIds(ids) {
  if (!ids || !ids.length) return [];
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  const now = new Date();

  return Brand.aggregate([
    {
      $match: { _id: { $in: objectIds }, status: 'active' }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    {
      $unwind: {
        path: '$categoryInfo',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'vouchers',
        let: { brandId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$brandId', '$$brandId'] },
                  { $eq: ['$status', 'ACTIVE'] },
                  { $gt: ['$expirationDate', now] },
                  { $gt: ['$availableQuantity', 0] }
                ]
              }
            }
          }
        ],
        as: 'activeVouchers'
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        code: 1,
        rating: { $ifNull: ['$rating', 4.8] },
        logo_url: 1,
        cover_image_url: 1,
        description: 1,
        status: 1,
        categoryId: 1,
        categoryName: { $ifNull: ['$categoryInfo.name', 'General'] },
        activeVouchersCount: { $size: '$activeVouchers' },
        isFavorite: { $literal: true }
      }
    }
  ]);
}

async function create(data) {
  const brand = new Brand(data);
  return brand.save();
}

module.exports = {
  findAllWithActiveVoucherCount,
  findById,
  findByCode,
  findByIds,
  create
};
