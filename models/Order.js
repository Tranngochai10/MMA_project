const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    isDemo: { type: Boolean, default: false },
    currency: { type: String, enum: ['VND'], default: 'VND' },
    paymentReference: String,
    bankDetails: { accountNumber: String, accountName: String, bankBin: String },
    bankTransactionId: String,
    voucherSnapshot: mongoose.Schema.Types.Mixed,
    inventoryReserved: { type: Boolean, default: false },
    paymentExpiresAt: Date,
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    confirmedAt: Date,
    requestKey: { type: String, default: undefined },
    purchaseResult: { type: mongoose.Schema.Types.Mixed, default: undefined },
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
      default: 'MB_BANK_TRANSFER',
      trim: true
    },
    status: {
      type: String,
      enum: ['PAID', 'PENDING', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
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
orderSchema.index({ userId: 1, requestKey: 1 }, { unique: true, partialFilterExpression: { requestKey: { $type: 'string' } } });
orderSchema.index({ paymentReference: 1 }, { unique: true, partialFilterExpression: { paymentReference: { $type: 'string' } } });
orderSchema.index({ bankTransactionId: 1 }, { unique: true, partialFilterExpression: { bankTransactionId: { $type: 'string' } } });

module.exports = mongoose.model('Order', orderSchema);
