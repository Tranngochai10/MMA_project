const mongoose = require('mongoose');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Voucher = require('../models/Voucher');
const UserVoucher = require('../models/UserVoucher');
const Order = require('../models/Order');
const brandRepository = require('../repositories/brandRepository');
const voucherRepository = require('../repositories/voucherRepository');
const orderRepository = require('../repositories/orderRepository');
const userVoucherRepository = require('../repositories/userVoucherRepository');
const notificationRepository = require('../repositories/notificationRepository');
const ApiError = require('../utils/ApiError');

function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// -------------------------------------------------------------
// 1. BRAND MANAGEMENT
// -------------------------------------------------------------
async function getManagerBrands() {
  return brandRepository.findAllWithActiveVoucherCount();
}

async function createManagerBrand(data) {
  if (!data.name || !data.code) {
    throw new ApiError(400, 'Tên thương hiệu và mã code (2 ký tự viết hoa) là bắt buộc');
  }

  const cleanCode = data.code.trim().toUpperCase();
  if (cleanCode.length !== 2) {
    throw new ApiError(400, 'Mã thương hiệu bắt buộc phải gồm đúng 2 ký tự viết hoa (VD: SB, SS, AT)');
  }

  const existing = await brandRepository.findByCode(cleanCode);
  if (existing) {
    throw new ApiError(409, `Mã thương hiệu "${cleanCode}" đã tồn tại trên hệ thống`);
  }

  const brand = await brandRepository.create({
    name: data.name.trim(),
    code: cleanCode,
    categoryId: data.categoryId || null,
    rating: data.rating ? Number(data.rating) : 4.8,
    logo_url: data.logo_url || '',
    cover_image_url: data.cover_image_url || '',
    description: data.description || '',
    status: 'active'
  });

  return brand;
}

async function getManagerBrandById(id) {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'ID thương hiệu không hợp lệ');
  }

  const brand = await brandRepository.findById(id);
  if (!brand) {
    throw new ApiError(404, 'Không tìm thấy thương hiệu');
  }

  const now = new Date();
  const activeVouchersCount = await voucherRepository.countVouchers({
    brandId: brand._id,
    status: 'ACTIVE',
    expirationDate: { $gt: now },
    availableQuantity: { $gt: 0 }
  });

  const category = brand.categoryId || {};

  return {
    _id: brand._id,
    name: brand.name,
    code: brand.code,
    description: brand.description || '',
    logo_url: brand.logo_url || '',
    cover_image_url: brand.cover_image_url || '',
    rating: brand.rating || 4.8,
    status: brand.status,
    categoryId: category._id || null,
    categoryName: category.name || 'General',
    activeVouchersCount,
    created_at: brand.created_at
  };
}

async function updateManagerBrand(id, data) {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'ID thương hiệu không hợp lệ');
  }

  const existing = await brandRepository.findById(id);
  if (!existing) {
    throw new ApiError(404, 'Không tìm thấy thương hiệu để cập nhật');
  }

  const updateFields = {};
  if (data.name !== undefined) updateFields.name = data.name.trim();
  if (data.description !== undefined) updateFields.description = data.description;
  if (data.logo_url !== undefined) updateFields.logo_url = data.logo_url;
  if (data.cover_image_url !== undefined) updateFields.cover_image_url = data.cover_image_url;
  if (data.rating !== undefined) updateFields.rating = Number(data.rating);
  if (data.status !== undefined) updateFields.status = data.status;
  if (data.categoryId !== undefined) updateFields.categoryId = data.categoryId;

  if (data.code !== undefined) {
    const cleanCode = data.code.trim().toUpperCase();
    if (cleanCode.length !== 2) {
      throw new ApiError(400, 'Mã thương hiệu bắt buộc phải gồm đúng 2 ký tự viết hoa (VD: SB, SS, AT)');
    }
    if (cleanCode !== existing.code) {
      const codeDuplicate = await brandRepository.findByCode(cleanCode);
      if (codeDuplicate && codeDuplicate._id.toString() !== id.toString()) {
        throw new ApiError(409, `Mã thương hiệu "${cleanCode}" đã tồn tại trên hệ thống`);
      }
      updateFields.code = cleanCode;
    }
  }

  const updated = await brandRepository.updateById(id, updateFields);
  return updated;
}

// -------------------------------------------------------------
// 2. DASHBOARD & STATISTICS (TOÀN SÀN HOẶC LỌC THEO BRAND)
// -------------------------------------------------------------
async function getDashboardStats(queryParams = {}) {
  const { brandId } = queryParams;
  const filter = {};
  if (brandId && mongoose.Types.ObjectId.isValid(brandId)) {
    filter.brandId = brandId;
  }

  const [
    activeVouchers,
    totalOrders,
    issuedVouchers,
    simulatedRedemptions,
    totalRevenue,
    recentOrdersData,
    recentRedemptionsData
  ] = await Promise.all([
    voucherRepository.countVouchers({ ...filter, status: 'ACTIVE' }),
    orderRepository.countOrders({ ...filter, status: 'PAID' }),
    userVoucherRepository.countIssued(filter),
    userVoucherRepository.countRedemptions(filter),
    orderRepository.sumRevenue(filter),
    orderRepository.findAll(filter, { page: 1, limit: 3 }),
    userVoucherRepository.findManagerRedemptions(filter, { page: 1, limit: 2 })
  ]);

  const recentOrders = recentOrdersData.orders.map((ord) => ({
    id: ord.orderCode,
    voucherTitle: ord.voucherId ? ord.voucherId.title : 'Voucher',
    brandName: ord.brandId ? ord.brandId.name : '',
    amount: ord.totalAmount,
    status: ord.status,
    createdAt: ord.created_at ? ord.created_at.toISOString() : new Date().toISOString()
  }));

  const recentRedemptions = recentRedemptionsData.redemptions.map((red) => ({
    id: red._id.toString(),
    voucherCode: red.voucherCode,
    customerName: red.user ? red.user.full_name : 'Khách hàng',
    voucherTitle: red.voucher ? red.voucher.title : 'Voucher',
    redeemedDate: formatDateTime(red.used_at),
    status: 'CONFIRMED'
  }));

  return {
    stats: {
      activeVouchers,
      totalOrders,
      issuedVouchers,
      simulatedRedemptions,
      totalRevenue
    },
    recentOrders,
    recentRedemptions
  };
}

// -------------------------------------------------------------
// 3. VOUCHER MANAGEMENT (CRUD & STATUS TOGGLE)
// -------------------------------------------------------------
function formatManagerVoucher(v) {
  const brand = v.brandId || {};
  const category = v.categoryId || {};

  return {
    id: v._id.toString(),
    _id: v._id,
    brandId: brand._id ? brand._id.toString() : (v.brandId ? v.brandId.toString() : ''),
    brandName: brand.name || '',
    brandLogo: brand.logo_url || '',
    title: v.title,
    description: v.description || '',
    category: category.name || 'General',
    categoryId: category._id || v.categoryId || null,
    discountType: v.discountType,
    discountValue: v.discountValue,
    discountDisplay: v.discountDisplay || `${v.discountValue}% OFF`,
    sellingPrice: v.sellingPrice,
    originalValue: v.originalValue,
    startDate: v.startDate ? new Date(v.startDate).toISOString().split('T')[0] : '',
    expirationDate: v.expirationDate ? new Date(v.expirationDate).toISOString().split('T')[0] : '',
    usageConditions: v.termsAndConditions && v.termsAndConditions.length ? v.termsAndConditions : [],
    termsAndConditions: v.termsAndConditions || [],
    totalQuantity: v.totalQuantity,
    availableQuantity: v.availableQuantity,
    coverImage: v.coverImage || v.thumbnail_url || '',
    thumbnail_url: v.thumbnail_url || v.coverImage || '',
    status: v.status,
    created_at: v.created_at
  };
}

async function getManagerVouchers(queryParams = {}) {
  const { brandId, status, search, page = 1, limit = 20 } = queryParams;
  const filter = {};
  if (brandId && mongoose.Types.ObjectId.isValid(brandId)) {
    filter.brandId = brandId;
  }
  if (status) {
    filter.status = status;
  }
  if (search) {
    filter.search = search;
  }

  const { vouchers, total } = await voucherRepository.findManagerVouchers(filter, { page, limit });

  return {
    vouchers: vouchers.map(formatManagerVoucher),
    total,
    page: Number(page),
    limit: Number(limit)
  };
}

async function getManagerVoucherById(id) {
  const voucher = await voucherRepository.findById(id);
  if (!voucher) {
    throw new ApiError(404, 'Không tìm thấy chiến dịch voucher');
  }
  return formatManagerVoucher(voucher);
}

async function createManagerVoucher(managerId, data) {
  if (!data.brandId) {
    throw new ApiError(400, 'Vui lòng chọn Thương hiệu đối tác (brandId)');
  }
  if (!data.title || !data.title.trim()) {
    throw new ApiError(400, 'Tiêu đề voucher là bắt buộc');
  }
  if (!data.originalValue || Number(data.originalValue) <= 0) {
    throw new ApiError(400, 'Giá gốc voucher phải lớn hơn 0');
  }
  if (!data.sellingPrice || Number(data.sellingPrice) <= 0) {
    throw new ApiError(400, 'Giá bán voucher phải lớn hơn 0');
  }
  if (!data.totalQuantity || Number(data.totalQuantity) <= 0) {
    throw new ApiError(400, 'Tổng số lượng phát hành phải lớn hơn 0');
  }
  if (!data.expirationDate) {
    throw new ApiError(400, 'Ngày hết hạn voucher là bắt buộc');
  }

  const brand = await brandRepository.findById(data.brandId);
  if (!brand) {
    throw new ApiError(404, 'Thương hiệu được chọn không tồn tại');
  }

  const discountType = data.discountType || 'PERCENTAGE';
  const discountValue = Number(data.discountValue) || 0;
  const discountDisplay =
    data.discountDisplay ||
    (discountType === 'PERCENTAGE' ? `GIẢM ${discountValue}%` : `GIẢM $${discountValue}`);

  const conditions = Array.isArray(data.usageConditions)
    ? data.usageConditions
    : Array.isArray(data.termsAndConditions)
    ? data.termsAndConditions
    : typeof data.conditionsText === 'string'
    ? data.conditionsText.split('\n').map((s) => s.trim()).filter(Boolean)
    : ['Áp dụng quy định đổi voucher tiêu chuẩn của thương hiệu.'];

  const totalQuantity = Number(data.totalQuantity);

  let categoryId = data.categoryId || brand.categoryId;
  if (!categoryId) {
    const defaultCat = await Category.findOne({});
    if (defaultCat) {
      categoryId = defaultCat._id;
    }
  }

  const voucher = await voucherRepository.create({
    brandId: brand._id,
    categoryId: categoryId,
    managerId: managerId,
    title: data.title.trim(),
    description: data.description || '',
    discountType: discountType,
    discountValue: discountValue,
    discountDisplay: discountDisplay,
    sellingPrice: Number(data.sellingPrice),
    originalValue: Number(data.originalValue),
    totalQuantity: totalQuantity,
    availableQuantity: totalQuantity,
    startDate: data.startDate ? new Date(data.startDate) : new Date(),
    expirationDate: new Date(data.expirationDate),
    termsAndConditions: conditions,
    coverImage: data.coverImage || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
    thumbnail_url: data.thumbnail_url || data.coverImage || '',
    status: data.status === 'DRAFT' ? 'DRAFT' : 'ACTIVE'
  });

  return formatManagerVoucher(voucher);
}

async function updateManagerVoucher(id, data) {
  const existing = await voucherRepository.findById(id);
  if (!existing) {
    throw new ApiError(404, 'Không tìm thấy voucher để cập nhật');
  }

  const updateFields = {};
  if (data.title !== undefined) updateFields.title = data.title.trim();
  if (data.description !== undefined) updateFields.description = data.description;
  if (data.sellingPrice !== undefined) updateFields.sellingPrice = Number(data.sellingPrice);
  if (data.originalValue !== undefined) updateFields.originalValue = Number(data.originalValue);
  if (data.discountType !== undefined) updateFields.discountType = data.discountType;
  if (data.discountValue !== undefined) updateFields.discountValue = Number(data.discountValue);
  if (data.discountDisplay !== undefined) updateFields.discountDisplay = data.discountDisplay;
  if (data.expirationDate !== undefined) updateFields.expirationDate = new Date(data.expirationDate);
  if (data.coverImage !== undefined) updateFields.coverImage = data.coverImage;
  if (data.thumbnail_url !== undefined) updateFields.thumbnail_url = data.thumbnail_url;
  if (data.categoryId !== undefined) updateFields.categoryId = data.categoryId;

  if (data.totalQuantity !== undefined) {
    const newTotal = Number(data.totalQuantity);
    const diff = newTotal - existing.totalQuantity;
    updateFields.totalQuantity = newTotal;
    updateFields.availableQuantity = Math.max(0, existing.availableQuantity + diff);
  }

  if (data.usageConditions) {
    updateFields.termsAndConditions = Array.isArray(data.usageConditions)
      ? data.usageConditions
      : [data.usageConditions];
  } else if (data.termsAndConditions) {
    updateFields.termsAndConditions = Array.isArray(data.termsAndConditions)
      ? data.termsAndConditions
      : [data.termsAndConditions];
  }

  const updated = await voucherRepository.updateById(id, updateFields);
  return formatManagerVoucher(updated);
}

async function updateManagerVoucherStatus(id, status) {
  if (!['ACTIVE', 'PAUSED', 'DRAFT', 'ENDED'].includes(status)) {
    throw new ApiError(400, 'Trạng thái không hợp lệ (hỗ trợ ACTIVE, PAUSED, DRAFT, ENDED)');
  }
  const updated = await voucherRepository.updateStatus(id, status);
  if (!updated) {
    throw new ApiError(404, 'Không tìm thấy voucher');
  }
  return formatManagerVoucher(updated);
}

// -------------------------------------------------------------
// 4. MANAGER ORDERS
// -------------------------------------------------------------
async function getManagerOrders(queryParams = {}) {
  const { brandId, status, search, page = 1, limit = 20 } = queryParams;
  const filter = {};
  if (brandId && mongoose.Types.ObjectId.isValid(brandId)) {
    filter.brandId = brandId;
  }
  if (status) {
    filter.status = status;
  }
  if (search) {
    filter.search = search;
  }

  const { orders, total } = await orderRepository.findAll(filter, { page, limit });

  return {
    orders: orders.map((ord) => {
      const user = ord.userId || {};
      const voucher = ord.voucherId || {};
      const brand = ord.brandId || {};
      const wallet = ord.walletVoucherId || {};

      return {
        _id: ord._id,
        id: ord.orderCode,
        orderCode: ord.orderCode,
        customerName: user.full_name || 'Khách hàng',
        customerEmail: user.email || '',
        customerPhone: user.phone || '',
        voucherId: voucher._id || null,
        voucherTitle: voucher.title || 'Voucher',
        brandName: brand.name || '',
        brandLogo: brand.logo_url || '',
        amount: ord.totalAmount,
        paymentMethod: ord.paymentMethod,
        status: ord.status,
        createdAt: ord.created_at ? ord.created_at.toISOString() : new Date().toISOString(),
        voucherCode: wallet.voucherCode || '',
        isUsed: wallet.is_used || false
      };
    }),
    total,
    page: Number(page),
    limit: Number(limit)
  };
}

// -------------------------------------------------------------
// 5. REDEMPTIONS & COUNTER VERIFICATION
// -------------------------------------------------------------
async function getManagerRedemptions(queryParams = {}) {
  const { brandId, search, page = 1, limit = 20 } = queryParams;
  const filter = {};
  if (brandId && mongoose.Types.ObjectId.isValid(brandId)) {
    filter.brandId = brandId;
  }
  if (search) {
    filter.search = search;
  }

  const { redemptions, total } = await userVoucherRepository.findManagerRedemptions(filter, {
    page,
    limit
  });

  return {
    redemptions: redemptions.map((red) => ({
      id: red._id.toString(),
      voucherId: red.voucher ? red.voucher._id.toString() : '',
      voucherTitle: red.voucher ? red.voucher.title : 'Voucher',
      voucherCode: red.voucherCode,
      customerName: red.user ? red.user.full_name : 'Khách hàng',
      customerPhone: red.user ? red.user.phone : '',
      brandName: red.brand ? red.brand.name : '',
      redeemedDate: formatDateTime(red.used_at),
      status: 'CONFIRMED'
    })),
    total,
    page: Number(page),
    limit: Number(limit)
  };
}

async function verifyVoucherAtCounter(voucherCode) {
  if (!voucherCode) {
    throw new ApiError(400, 'Vui lòng nhập hoặc quét mã voucher');
  }

  const userVoucher = await UserVoucher.findOne({
    voucherCode: voucherCode.toUpperCase().trim()
  })
    .populate('userId', 'full_name email phone')
    .populate({
      path: 'voucherId',
      select: 'title description discountDisplay sellingPrice originalValue expirationDate termsAndConditions brandId',
      populate: { path: 'brandId', select: 'name code logo_url' }
    });

  if (!userVoucher) {
    throw new ApiError(404, 'Mã voucher không tồn tại trong hệ thống');
  }

  const voucher = userVoucher.voucherId || {};
  const brand = voucher.brandId || {};
  const customer = userVoucher.userId || {};

  const now = new Date();
  const isExpired = new Date(userVoucher.expires_at) <= now;

  let validityStatus = 'VALID';
  let validityMessage = 'Mã hợp lệ, sẵn sàng áp dụng giảm giá';

  if (userVoucher.is_used) {
    validityStatus = 'ALREADY_USED';
    validityMessage = `Mã này đã được sử dụng lúc ${formatDateTime(userVoucher.used_at)}`;
  } else if (isExpired) {
    validityStatus = 'EXPIRED';
    validityMessage = 'Mã ưu đãi đã hết hạn sử dụng';
  }

  return {
    voucherCode: userVoucher.voucherCode,
    validityStatus,
    validityMessage,
    isUsed: userVoucher.is_used,
    usedAt: userVoucher.used_at ? userVoucher.used_at.toISOString() : null,
    expiresAt: userVoucher.expires_at.toISOString(),
    customer: {
      name: customer.full_name || 'Khách hàng',
      phone: customer.phone || '',
      email: customer.email || ''
    },
    voucher: {
      title: voucher.title,
      discountDisplay: voucher.discountDisplay,
      sellingPrice: voucher.sellingPrice,
      originalValue: voucher.originalValue,
      brandName: brand.name || '',
      brandLogo: brand.logo_url || ''
    }
  };
}

async function redeemVoucherAtCounter(voucherCode) {
  if (!voucherCode) {
    throw new ApiError(400, 'Vui lòng nhập mã voucher cần sử dụng');
  }

  const userVoucher = await UserVoucher.findOne({
    voucherCode: voucherCode.toUpperCase().trim()
  })
    .populate('userId', 'full_name')
    .populate({
      path: 'voucherId',
      select: 'title brandId',
      populate: { path: 'brandId', select: 'name' }
    });

  if (!userVoucher) {
    throw new ApiError(404, 'Mã voucher không tồn tại');
  }

  if (userVoucher.is_used) {
    throw new ApiError(400, `Mã voucher này đã được sử dụng trước đó (lúc ${formatDateTime(userVoucher.used_at)})`);
  }

  const now = new Date();
  if (new Date(userVoucher.expires_at) <= now) {
    throw new ApiError(400, 'Mã voucher này đã hết hạn sử dụng');
  }

  userVoucher.is_used = true;
  userVoucher.used_at = now;
  await userVoucher.save();

  // Gửi thông báo cho khách hàng
  if (userVoucher.userId) {
    const voucher = userVoucher.voucherId || {};
    await notificationRepository.create({
      userId: userVoucher.userId._id,
      type: 'REDEMPTION_CONFIRMED',
      title: 'Đổi voucher tại quầy thành công',
      message: `Voucher ${userVoucher.voucherCode} (${voucher.title || 'Ưu đãi'}) đã được nhân viên cửa hàng quét áp dụng.`,
      actionUrl: '/(user)/wallet'
    });
  }

  return {
    voucherCode: userVoucher.voucherCode,
    status: 'CONFIRMED',
    redeemedDate: formatDateTime(now),
    customerName: userVoucher.userId ? userVoucher.userId.full_name : 'Khách hàng',
    voucherTitle: userVoucher.voucherId ? userVoucher.voucherId.title : 'Ưu đãi'
  };
}

module.exports = {
  getManagerBrands,
  getManagerBrandById,
  createManagerBrand,
  updateManagerBrand,
  getDashboardStats,
  getManagerVouchers,
  getManagerVoucherById,
  createManagerVoucher,
  updateManagerVoucher,
  updateManagerVoucherStatus,
  getManagerOrders,
  getManagerRedemptions,
  verifyVoucherAtCounter,
  redeemVoucherAtCounter
};
