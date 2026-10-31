const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    // Mã đơn hàng định dạng chuẩn (VD: ORD-94821)
    orderCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
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
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
      index: true
    },
    walletVoucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserVoucher',
      default: null
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      default: 'Credit Card',
      trim: true
    },
    status: {
      type: String,
      enum: ['PAID', 'PENDING', 'FAILED', 'CANCELLED'],
      default: 'PAID',
      index: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

// Indexes tối ưu truy vấn lịch sử đơn hàng
orderSchema.index({ userId: 1, status: 1, created_at: -1 });
orderSchema.index({ brandId: 1, status: 1, created_at: -1 });

module.exports = mongoose.model('Order', orderSchema);
