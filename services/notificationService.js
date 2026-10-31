const notificationRepository = require('../repositories/notificationRepository');
const ApiError = require('../utils/ApiError');

function formatTimeAgo(date) {
  if (!date) return 'Vừa xong';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Vừa xong';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(date).toLocaleDateString('vi-VN');
}

function formatNotification(item) {
  return {
    _id: item._id,
    id: item._id.toString(),
    type: item.type,
    title: item.title,
    message: item.message,
    isRead: item.isRead,
    actionUrl: item.actionUrl || '',
    createdAt: formatTimeAgo(item.created_at),
    timestamp: item.created_at ? item.created_at.toISOString() : new Date().toISOString()
  };
}

async function getUserNotifications(userId) {
  const [notifications, unreadCount] = await Promise.all([
    notificationRepository.findByUserId(userId),
    notificationRepository.countUnread(userId)
  ]);

  return {
    notifications: notifications.map(formatNotification),
    unreadCount
  };
}

async function markNotificationAsRead(id, userId) {
  const updated = await notificationRepository.markAsRead(id, userId);
  if (!updated) {
    throw new ApiError(404, 'Không tìm thấy thông báo hoặc bạn không có quyền truy cập');
  }
  return formatNotification(updated);
}

async function markAllNotificationsAsRead(userId) {
  await notificationRepository.markAllAsRead(userId);
  return { success: true, message: 'Đã đánh dấu tất cả thông báo là đã đọc' };
}

async function createNotification(userId, notificationData, session = null) {
  return notificationRepository.create(
    {
      userId,
      ...notificationData
    },
    session
  );
}

module.exports = {
  formatNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification
};
