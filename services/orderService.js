const orderRepository = require('../repositories/orderRepository');
const ApiError = require('../utils/ApiError');

function formatOrder(order) {
  const voucher = order.voucherId || {};
  const brand = order.brandId || {};
  const wallet = order.walletVoucherId || {};

  return {
    _id: order._id,
    paymentReference: order.paymentReference,
    id: order.orderCode,
    orderCode: order.orderCode,
    voucherId: voucher._id || null,
    voucherTitle: order.voucherSnapshot?.title || order.purchaseResult?.voucherTitle || voucher.title || 'Ưu đãi voucher',
    brandName: order.voucherSnapshot?.brandName || order.purchaseResult?.brandName || brand.name || 'Thương hiệu',
    brandLogo: order.voucherSnapshot?.brandLogo || order.purchaseResult?.brandLogo || brand.logo_url || '',
    isDemo: order.isDemo === true,
    amount: order.totalAmount || 0,
    paymentMethod: order.paymentMethod || '',
    status: order.status || 'PENDING',
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
