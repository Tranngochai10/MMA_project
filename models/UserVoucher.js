const mongoose = require('mongoose');

const userVoucherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Voucher',
      required: true,
      index: true
    },
    // Mã voucher duy nhất: 2 chữ cái thương hiệu + 6 ký tự số (VD: SB184920)
    voucherCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    // Mã đơn hàng giao dịch (VD: ORD-94821)
    orderCode: {
      type: String,
      trim: true,
      default: ''
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    paymentMethod: {
      type: String,
      default: 'Credit Card'
    },
    is_used: {
      type: Boolean,
      default: false,
      index: true
    },
    used_at: {
      type: Date,
      default: null
    },
    expires_at: {
      type: Date,
      required: true,
      index: true
    },
    purchased_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

// Compound index tối ưu lọc ví voucher theo người dùng, trạng thái sử dụng và hạn dùng
userVoucherSchema.index({ userId: 1, is_used: 1, expires_at: 1 });

module.exports = mongoose.model('UserVoucher', userVoucherSchema);
