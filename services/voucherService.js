const mongoose = require('mongoose');
const voucherRepository = require('../repositories/voucherRepository');
const userVoucherRepository = require('../repositories/userVoucherRepository');
const userRepository = require('../repositories/userRepository');
const brandRepository = require('../repositories/brandRepository');
const { generateUniqueVoucherCode, generateOrderCode } = require('../utils/voucherCodeGenerator');
const ApiError = require('../utils/ApiError');

function formatVoucherCard(v, favoriteSet = new Set()) {
  return {
    _id: v._id,
    title: v.title,
    brand: {
      _id: v.brandId ? v.brandId._id : null,
      name: v.brandId ? v.brandId.name : '',
      code: v.brandId ? v.brandId.code : '',
      logo_url: v.brandId ? v.brandId.logo_url : '',
      rating: v.brandId ? v.brandId.rating : 4.8
    },
    category: v.categoryId ? v.categoryId.name : 'General',
    categoryId: v.categoryId ? v.categoryId._id : null,
    discountType: v.discountType,
    discountValue: v.discountValue,
    discountPercent: v.discountValue,
    discountDisplay: v.discountDisplay || `${v.discountValue}% OFF`,
    sellingPrice: v.sellingPrice,
    originalValue: v.originalValue,
    expirationDate: v.expirationDate,
    availableQuantity: v.availableQuantity,
    thumbnail_url: v.thumbnail_url || v.coverImage || '',
    isFavorite: favoriteSet.has(v._id.toString())
  };
}

async function getVouchers({
  categoryId,
  brandId,
  search,
  sort,
  page = 1,
  limit = 20,
  currentUserId = null
}) {
  let favoriteSet = new Set();
  if (currentUserId) {
    const favoriteVoucherIds = await userRepository.getFavoriteVoucherIds(currentUserId);
    favoriteSet = new Set(favoriteVoucherIds.map((id) => id.toString()));
  }

  // Nếu người dùng không truyền bộ lọc tìm kiếm nào và đang ở trang 1 -> Sử dụng gợi ý cá nhân hóa
  const hasSpecificFilter = categoryId || brandId || (search && search.trim()) || sort;

  if (!hasSpecificFilter && currentUserId) {
    const topCategoryIds = await userVoucherRepository.getTopCategoryIdsByUserId(currentUserId, 3);
    const recommendedList = await voucherRepository.findRecommended(topCategoryIds, limit);
    return {
      vouchers: recommendedList.map((v) => formatVoucherCard(v, favoriteSet)),
      total: recommendedList.length,
      page: 1,
      limit: limit,
      isPersonalized: topCategoryIds.length > 0
    };
  }

  const { vouchers, total } = await voucherRepository.findWithFilters({
    categoryId,
    brandId,
    search,
    sort,
    page: Number(page),
    limit: Number(limit)
  });

  return {
    vouchers: vouchers.map((v) => formatVoucherCard(v, favoriteSet)),
    total,
    page: Number(page),
    limit: Number(limit)
  };
}

async function getVoucherById(id, currentUserId = null) {
  const voucher = await voucherRepository.findById(id);
  if (!voucher || voucher.status !== 'ACTIVE') {
    throw new ApiError(404, 'Không tìm thấy voucher hoặc ưu đãi đã kết thúc');
  }

  let isFavorite = false;
  if (currentUserId) {
    const favoriteVoucherIds = await userRepository.getFavoriteVoucherIds(currentUserId);
    isFavorite = favoriteVoucherIds.some((favId) => favId.toString() === voucher._id.toString());
  }

  return {
    _id: voucher._id,
    title: voucher.title,
    description: voucher.description || '',
    brand: {
      _id: voucher.brandId ? voucher.brandId._id : null,
      name: voucher.brandId ? voucher.brandId.name : '',
      code: voucher.brandId ? voucher.brandId.code : '',
      logo_url: voucher.brandId ? voucher.brandId.logo_url : '',
      cover_image_url: voucher.brandId ? voucher.brandId.cover_image_url : '',
      rating: voucher.brandId ? voucher.brandId.rating : 4.8
    },
    category: voucher.categoryId ? voucher.categoryId.name : 'General',
    discountType: voucher.discountType,
    discountValue: voucher.discountValue,
    discountDisplay: voucher.discountDisplay || `${voucher.discountValue}% OFF`,
    sellingPrice: voucher.sellingPrice,
    originalValue: voucher.originalValue,
    totalQuantity: voucher.totalQuantity,
    availableQuantity: voucher.availableQuantity,
    startDate: voucher.startDate,
    expirationDate: voucher.expirationDate,
    termsAndConditions: voucher.termsAndConditions.length
      ? voucher.termsAndConditions
      : [
          'Áp dụng tại tất cả các chi nhánh chính hãng trên toàn quốc.',
          'Mỗi mã ưu đãi chỉ có giá trị sử dụng 01 lần.',
          'Không áp dụng đồng thời với các chương trình khuyến mãi khác.',
          'Vui lòng xuất trình mã voucher cho nhân viên trước khi thanh toán.'
        ],
    coverImage: voucher.coverImage || '',
    thumbnail_url: voucher.thumbnail_url || voucher.coverImage || '',
    isFavorite: isFavorite
  };
}

function canUseTransactions() {
  try {
    const topology = mongoose.connection.client && mongoose.connection.client.topology;
    if (!topology || !topology.description) return false;
    const type = topology.description.type;
    return type === 'ReplicaSetWithPrimary' || type === 'Sharded';
  } catch {
    return false;
  }
}

/**
 * Mua voucher có bọc trong MongoDB Session / Transaction đảm bảo toàn vẹn dữ liệu
 */
async function buyVoucher(voucherId, userId, paymentMethod = 'Credit Card') {
  let session = null;
  let isTransactionActive = false;

  if (canUseTransactions()) {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
      isTransactionActive = true;
    } catch {
      session = null;
      isTransactionActive = false;
    }
  }

  try {
    // 1. Kiểm tra và giảm số lượng tồn kho theo Atomic Update
    const voucher = await voucherRepository.decrementAvailableQuantity(
      voucherId,
      isTransactionActive ? session : null
    );

    if (!voucher) {
      throw new ApiError(400, 'Voucher đã hết số lượng khả dụng hoặc đã hết hạn');
    }

    // 2. Lấy thông tin thương hiệu để lấy mã Brand Code (2 chữ cái)
    const brand = await brandRepository.findById(voucher.brandId);
    const brandCode = brand ? brand.code : 'VC';

    // 3. Sinh mã voucher duy nhất: 2 chữ Brand + 6 số ngẫu nhiên (VD: SB184920)
    const voucherCode = await generateUniqueVoucherCode(
      brandCode,
      isTransactionActive ? session : null
    );

    // 4. Sinh mã đơn hàng (VD: ORD-94821)
    const orderCode = generateOrderCode();

    // 5. Tạo bản ghi sở hữu vào UserVoucher
    const purchasedDate = new Date();
    await userVoucherRepository.create(
      {
        userId: userId,
        voucherId: voucher._id,
        voucherCode: voucherCode,
        orderCode: orderCode,
        totalAmount: voucher.sellingPrice,
        paymentMethod: paymentMethod || 'Credit Card',
        is_used: false,
        used_at: null,
        expires_at: voucher.expirationDate,
        purchased_at: purchasedDate
      },
      isTransactionActive ? session : null
    );

    if (isTransactionActive && session) {
      await session.commitTransaction();
    }

    return {
      orderCode: orderCode,
      voucherCode: voucherCode,
      voucherTitle: voucher.title,
      brandName: brand ? brand.name : '',
      brandLogo: brand ? brand.logo_url : '',
      totalAmount: voucher.sellingPrice,
      paymentMethod: paymentMethod || 'Credit Card',
      purchasedDate: purchasedDate.toISOString(),
      expirationDate: voucher.expirationDate.toISOString()
    };
  } catch (error) {
    if (isTransactionActive && session) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
}

module.exports = {
  getVouchers,
  getVoucherById,
  buyVoucher
};
