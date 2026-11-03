const crypto = require('crypto');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const Order = require('../models/Order');
const Voucher = require('../models/Voucher');
const Brand = require('../models/Brand');
const UserVoucher = require('../models/UserVoucher');
const voucherRepository = require('../repositories/voucherRepository');
const { generateOrderCode, generateUniqueVoucherCode } = require('../utils/voucherCodeGenerator');
const { resolveVoucherImage } = require('../utils/voucherMedia');
const { vietQr } = require('../utils/vietQr');
const ApiError = require('../utils/ApiError');

function bankConfig() {
  const accountNumber = process.env.MB_ACCOUNT_NUMBER?.trim();
  const accountName = process.env.MB_ACCOUNT_NAME?.trim();
  if (process.env.MB_PAYMENT_ENABLED !== 'true' || !/^\d{6,25}$/.test(accountNumber || '') || !accountName)
    throw new ApiError(503, 'Thanh toán MB chưa được cấu hình tài khoản và tên người nhận.');
  return { bankBin: '970422', accountNumber, accountName };
}
function requireTransactions() {
  const type = mongoose.connection.client?.topology?.description?.type;
  if (!['ReplicaSetWithPrimary', 'Sharded'].includes(type))
    throw new ApiError(503, 'Thanh toán cần MongoDB replica set để bảo đảm đơn hàng và tồn kho.');
}
async function formatPayment(order) {
  const canPay = process.env.MB_PAYMENT_ENABLED === 'true' && order.status === 'PENDING' && new Date(order.paymentExpiresAt) > new Date();
  return {
    id: String(order._id), orderCode: order.orderCode, voucherId: String(order.voucherId),
    status: order.status, amount: order.totalAmount, currency: 'VND',
    paymentReference: order.paymentReference, bankDetails: order.bankDetails,
    expiresAt: order.paymentExpiresAt, canPay, walletVoucherId: order.walletVoucherId,
    qrImage: canPay ? await QRCode.toDataURL(vietQr({ ...(order.bankDetails.toObject?.() || order.bankDetails),
      amount: order.totalAmount, reference: order.paymentReference }), { width: 512, margin: 3 }) : null,
  };
}
async function createTransferOrder(voucherId, userId, requestKey) {
  const bankDetails = bankConfig();
  if (!mongoose.isValidObjectId(voucherId)) throw new ApiError(400, 'Voucher không hợp lệ.');
  if (typeof requestKey !== 'string' || !/^[a-zA-Z0-9_-]{8,128}$/.test(requestKey)) throw new ApiError(400, 'Thiếu mã chống tạo đơn trùng.');
  const previous = await Order.findOne({ userId, requestKey });
  if (previous) {
    if (String(previous.voucherId) !== String(voucherId) || previous.paymentMethod !== 'MB_BANK_TRANSFER') throw new ApiError(409, 'Mã yêu cầu đã được sử dụng.');
    return formatPayment(previous);
  }
  requireTransactions();
  let result;
  try {
    await mongoose.connection.transaction(async session => {
      if (await Order.countDocuments({ userId, status: 'PENDING', paymentMethod: 'MB_BANK_TRANSFER' }).session(session) >= 3)
        throw new ApiError(409, 'Bạn có 3 đơn đang chờ thanh toán. Vui lòng hoàn tất trước.');
      const voucher = await voucherRepository.decrementAvailableQuantity(voucherId, session);
      if (!voucher) throw new ApiError(409, 'Voucher đã hết hàng hoặc hết hạn.');
      if (!Number.isSafeInteger(voucher.sellingPrice) || voucher.sellingPrice <= 0 || voucher.sellingPrice > 9999999999999) throw new ApiError(400, 'Giá voucher phải là số nguyên VND hợp lệ lớn hơn 0.');
      const brand = await Brand.findById(voucher.brandId).session(session);
      if (!brand) throw new ApiError(409, 'Thương hiệu không còn tồn tại.');
      const [order] = await Order.create([{
        orderCode: generateOrderCode(), userId, voucherId, brandId: brand._id,
        totalAmount: voucher.sellingPrice, paymentMethod: 'MB_BANK_TRANSFER', status: 'PENDING',
        isDemo: false, requestKey, currency: 'VND', bankDetails,
        paymentReference: 'DL' + crypto.randomBytes(10).toString('hex').toUpperCase(),
        inventoryReserved: true, paymentExpiresAt: new Date(Math.min(Date.now() + 30 * 60000, new Date(voucher.expirationDate).getTime())),
        voucherSnapshot: { title: voucher.title, description: voucher.description || '', brandName: brand.name,
          brandLogo: brand.logo_url || '', brandCode: brand.code, sellingPrice: voucher.sellingPrice,
          originalValue: voucher.originalValue, discountDisplay: voucher.discountDisplay,
          termsAndConditions: voucher.termsAndConditions || [], coverImage: resolveVoucherImage(voucher), expirationDate: voucher.expirationDate }
      }], { session });
      result = order;
    });
  } catch (error) {
    if (error.code === 11000) {
      const replay = await Order.findOne({ userId, requestKey, voucherId });
      if (replay) return formatPayment(replay);
    }
    throw error;
  }
  return formatPayment(result);
}
async function getTransferOrder(id, userId) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'Mã đơn không hợp lệ.');
  const order = await Order.findOne({ _id: id, userId, paymentMethod: 'MB_BANK_TRANSFER' });
  if (!order) throw new ApiError(404, 'Không tìm thấy đơn chuyển khoản.');
  return formatPayment(order);
}
async function confirmTransfer(id, managerId, { bankTransactionId, receivedAmount }) {
  if (!mongoose.isValidObjectId(id) || typeof bankTransactionId !== 'string' || !/^[a-zA-Z0-9._-]{4,100}$/.test(bankTransactionId.trim()) || !Number.isSafeInteger(receivedAmount))
    throw new ApiError(400, 'Nhập mã giao dịch ngân hàng và số tiền thực nhận hợp lệ.');
  bankTransactionId = bankTransactionId.trim().toUpperCase();
  requireTransactions();
  let result;
  try {
    await mongoose.connection.transaction(async session => {
      const order = await Order.findById(id).session(session);
      if (!order || order.paymentMethod !== 'MB_BANK_TRANSFER') throw new ApiError(404, 'Không tìm thấy đơn chuyển khoản.');
      if (receivedAmount !== order.totalAmount) throw new ApiError(409, 'Số tiền thực nhận không khớp đơn hàng.');
      if (order.status === 'PAID' && order.bankTransactionId === bankTransactionId) { result = order; return; }
      if (order.status !== 'PENDING') throw new ApiError(409, 'Đơn không ở trạng thái chờ thanh toán.');
      const snapshot = order.voucherSnapshot;
      if (!snapshot || new Date(snapshot.expirationDate) <= new Date()) throw new ApiError(409, 'Voucher đã hết hạn. Cần xử lý hoàn tiền ngoài hệ thống.');
      const voucherCode = await generateUniqueVoucherCode(snapshot.brandCode, session);
      const [wallet] = await UserVoucher.create([{ userId: order.userId, voucherId: order.voucherId, orderId: order._id,
        orderCode: order.orderCode, voucherCode, expires_at: snapshot.expirationDate, snapshot }], { session });
      order.status = 'PAID'; order.bankTransactionId = bankTransactionId; order.confirmedBy = managerId;
      order.confirmedAt = new Date(); order.inventoryReserved = false; order.walletVoucherId = wallet._id;
      await order.save({ session });
      result = order;
    });
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, 'Mã giao dịch ngân hàng đã được xác nhận cho một đơn.');
    throw error;
  }
  return formatPayment(result);
}
async function cancelTransfer(id) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'Mã đơn không hợp lệ.');
  requireTransactions();
  await mongoose.connection.transaction(async session => {
    const order = await Order.findOne({ _id: id, paymentMethod: 'MB_BANK_TRANSFER' }).session(session);
    if (!order) throw new ApiError(404, 'Không tìm thấy đơn.');
    if (order.status === 'CANCELLED') return;
    if (order.status !== 'PENDING') throw new ApiError(409, 'Chỉ được hủy đơn chờ chưa nhận tiền.');
    if (order.inventoryReserved) await Voucher.updateOne({ _id: order.voucherId }, { $inc: { availableQuantity: 1 } }, { session });
    order.status = 'CANCELLED'; order.inventoryReserved = false;
    await order.save({ session });
  });
  return { status: 'CANCELLED' };
}
module.exports = { createTransferOrder, getTransferOrder, confirmTransfer, cancelTransfer, formatPayment, bankConfig };
