const mongoose = require('mongoose');
const User = require('../models/User');

async function findByEmail(email) {
  return User.findOne({ email: email.toLowerCase().trim() });
}

async function findByEmailWithPassword(email) {
  return User.findOne({ email: email.toLowerCase().trim() });
}

async function findById(id) {
  return User.findById(id).select('-password');
}

async function findByIdWithPassword(id) {
  return User.findById(id);
}

async function createUser(userData) {
  const user = new User(userData);
  return user.save();
}

async function getRoleNamesByUserId(userId) {
  const user = await User.findById(userId).select('role');
  if (!user || !user.role) {
    return [];
  }
  return [user.role];
}

async function updateById(userId, updateData) {
  return User.findByIdAndUpdate(userId, updateData, { returnDocument: 'after' }).select('-password');
}

async function toggleFavoriteBrand(userId, brandId) {
  const user = await User.findById(userId);
  if (!user) return { isFavorite: false };

  const brandObjectId = new mongoose.Types.ObjectId(brandId);
  const exists = user.favoriteBrandIds.some((id) => id.equals(brandObjectId));

  if (exists) {
    await User.findByIdAndUpdate(userId, {
      $pull: { favoriteBrandIds: brandObjectId }
    });
    return { isFavorite: false };
  } else {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { favoriteBrandIds: brandObjectId }
    });
    return { isFavorite: true };
  }
}

async function toggleFavoriteVoucher(userId, voucherId) {
  const user = await User.findById(userId);
  if (!user) return { isFavorite: false };

  const voucherObjectId = new mongoose.Types.ObjectId(voucherId);
  const exists = user.favoriteVoucherIds.some((id) => id.equals(voucherObjectId));

  if (exists) {
    await User.findByIdAndUpdate(userId, {
      $pull: { favoriteVoucherIds: voucherObjectId }
    });
    return { isFavorite: false };
  } else {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { favoriteVoucherIds: voucherObjectId }
    });
    return { isFavorite: true };
  }
}

async function getFavoriteBrandIds(userId) {
  const user = await User.findById(userId).select('favoriteBrandIds');
  return user ? user.favoriteBrandIds : [];
}

async function getFavoriteVoucherIds(userId) {
  const user = await User.findById(userId).select('favoriteVoucherIds');
  return user ? user.favoriteVoucherIds : [];
}

module.exports = {
  findByEmail,
  findByEmailWithPassword,
  findById,
  findByIdWithPassword,
  createUser,
  getRoleNamesByUserId,
  updateById,
  toggleFavoriteBrand,
  toggleFavoriteVoucher,
  getFavoriteBrandIds,
  getFavoriteVoucherIds
};
