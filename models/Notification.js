const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: [
        'PURCHASE_SUCCESS',
        'VOUCHER_ISSUED',
        'EXPIRATION_REMINDER',
        'REDEMPTION_CONFIRMED',
        'PROMO'
      ],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    actionUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

notificationSchema.index({ userId: 1, isRead: 1, created_at: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
