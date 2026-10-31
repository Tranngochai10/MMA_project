const orderRepository = require('../repositories/orderRepository');
const ApiError = require('../utils/ApiError');

function formatOrder(order) {
  const voucher = order.voucherId || {};
  const brand = order.brandId || {};
  const wallet = order.walletVoucherId || {};

  return {
    _id: order._id,
    id: order.orderCode,
    orderCode: order.orderCode,
    voucherId: voucher._id || null,
    voucherTitle: voucher.title || 'Ưu đãi voucher',
    brandName: brand.name || 'Thương hiệu',
    brandLogo: brand.logo_url || '',
    amount: order.totalAmount || 0,
    paymentMethod: order.paymentMethod || 'Credit Card',
    status: order.status || 'PAID',
    createdAt: order.created_at ? order.created_at.toISOString() : new Date().toISOString(),
    walletVoucherId: wallet._id || (order.walletVoucherId ? order.walletVoucherId.toString() : null),
    voucherCode: wallet.voucherCode || '',
    isUsed: wallet.is_used || false,
    usedAt: wallet.used_at ? wallet.used_at.toISOString() : null,
    expiresAt: wallet.expires_at ? wallet.expires_at.toISOString() : null
  };
}

async function getUserOrders(userId, queryParams = {}) {
  const { status, search } = queryParams;
  const orders = await orderRepository.findByUserId(userId, { status, search });
  return orders.map(formatOrder);
}

async function getOrderDetail(orderId, userId = null) {
  const order = await orderRepository.findById(orderId, userId);
  if (!order) {
    throw new ApiError(404, 'Không tìm thấy thông tin đơn hàng');
  }
  return formatOrder(order);
}

module.exports = {
  formatOrder,
  getUserOrders,
  getOrderDetail
};
