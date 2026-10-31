const orderService = require('../services/orderService');
const { sendSuccess } = require('../utils/apiResponse');

async function getMyOrders(req, res) {
  const orders = await orderService.getUserOrders(req.user._id, req.query);
  return sendSuccess(res, 200, 'Lấy lịch sử đơn hàng thành công', orders);
}

async function getOrderById(req, res) {
  const order = await orderService.getOrderDetail(req.params.id, req.user._id);
  return sendSuccess(res, 200, 'Lấy chi tiết đơn hàng thành công', order);
}

module.exports = {
  getMyOrders,
  getOrderById
};
