const mongoose = require('mongoose');
const Notification = require('../models/Notification');

async function create(data, session = null) {
  const notification = new Notification(data);
  return notification.save({ session });
}

async function findByUserId(userId) {
  return Notification.find({ userId: new mongoose.Types.ObjectId(userId) })
    .sort({ created_at: -1 })
    .limit(50);
}

async function countUnread(userId) {
  return Notification.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    isRead: false
  });
}

async function markAsRead(id, userId) {
  return Notification.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId)
    },
    { isRead: true },
    { returnDocument: 'after' }
  );
}

async function markAllAsRead(userId) {
  return Notification.updateMany(
    {
      userId: new mongoose.Types.ObjectId(userId),
      isRead: false
    },
    { isRead: true }
  );
}

module.exports = {
  create,
  findByUserId,
  countUnread,
  markAsRead,
  markAllAsRead
};
