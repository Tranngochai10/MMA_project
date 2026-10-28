const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
      index: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    discountType: {
      type: String,
      enum: ['PERCENTAGE', 'FIXED'],
      default: 'PERCENTAGE'
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0
    },
    discountDisplay: {
      type: String,
      default: ''
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0
    },
    originalValue: {
      type: Number,
      required: true,
      min: 0
    },
    totalQuantity: {
      type: Number,
      required: true,
      min: 1
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    expirationDate: {
      type: Date,
      required: true,
      index: true
    },
    termsAndConditions: {
      type: [String],
      default: []
    },
    coverImage: {
      type: String,
      default: ''
    },
    thumbnail_url: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'ENDED'],
      default: 'ACTIVE',
      index: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

// Compound indexes phục vụ lọc nhanh
voucherSchema.index({ categoryId: 1, status: 1, expirationDate: 1 });
voucherSchema.index({ brandId: 1, status: 1 });

module.exports = mongoose.model('Voucher', voucherSchema);
