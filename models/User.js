const mongoose = require('mongoose');
const { ROLES, ROLE_LIST } = require('../constants/roles');

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    role: {
      type: String,
      enum: ROLE_LIST,
      default: ROLES.USER
    },
    avatar_url: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active'
    },

    favoriteBrandIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand'
      }
    ],
    favoriteVoucherIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Voucher'
      }
    ],
    resetOtp: {
      type: String,
      default: null
    },
    resetOtpHash: { type: String, default: null },
    resetOtpAttempts: { type: Number, default: 0 },
    tokenVersion: { type: Number, default: 0 },
    resetOtpExpires: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

module.exports = mongoose.model('User', userSchema);
