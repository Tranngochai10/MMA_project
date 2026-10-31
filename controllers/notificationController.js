const notificationService = require('../services/notificationService');
const { sendSuccess } = require('../utils/apiResponse');

async function getMyNotifications(req, res) {
  const data = await notificationService.getUserNotifications(req.user._id);
  return sendSuccess(res, 200, 'Lấy danh sách thông báo thành công', data);
}

async function markAsRead(req, res) {
  const data = await notificationService.markNotificationAsRead(req.params.id, req.user._id);
  return sendSuccess(res, 200, 'Đánh dấu thông báo đã đọc thành công', data);
}

async function markAllAsRead(req, res) {
  const data = await notificationService.markAllNotificationsAsRead(req.user._id);
  return sendSuccess(res, 200, 'Đánh dấu tất cả thông báo đã đọc thành công', data);
}

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead
};
