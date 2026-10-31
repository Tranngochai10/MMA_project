require('dotenv').config();
const mongoose = require('mongoose');
const { connectDatabase } = require('../config/database');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Voucher = require('../models/Voucher');
const User = require('../models/User');
const UserVoucher = require('../models/UserVoucher');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const { hashPassword } = require('../utils/password');

async function seed() {
  console.log('--- BẮT ĐẦU NẠP DỮ LIỆU SEED CHO VOUCHER PLATFORM ---');
  await connectDatabase();

  // 1. Dọn sạch dữ liệu cũ
  console.log('1. Làm sạch toàn bộ dữ liệu Category, Brand, Voucher, Order, Notification, UserVoucher...');
  await Category.deleteMany({});
  await Brand.deleteMany({});
  await Voucher.deleteMany({});
  await Order.deleteMany({});
  await Notification.deleteMany({});
  await UserVoucher.deleteMany({});

  // 2. Khởi tạo tài khoản Manager toàn sàn & User mẫu
  console.log('2. Khởi tạo tài khoản Manager và User thử nghiệm...');
  await User.deleteMany({ email: { $in: ['manager.sarah@brandhub.com', 'user.alex@example.com'] } });

  const managerPassword = await hashPassword('Manager2026!');
  const manager = await User.create({
    full_name: 'Sarah Jenkins',
    email: 'manager.sarah@brandhub.com',
    password: managerPassword,
    phone: '+1 (555) 890-1234',
    role: 'MANAGER',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    status: 'active'
  });

  const userPassword = await hashPassword('Voucher2026!');
  const demoUser = await User.create({
    full_name: 'Alex Rivera',
    email: 'user.alex@example.com',
    password: userPassword,
    phone: '0912 345 678',
    role: 'USER',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    status: 'active'
  });

  // 3. Khởi tạo Danh mục (Categories)
  console.log('3. Khởi tạo 8 danh mục ngành hàng...');
  const categoriesData = [
    { name: 'Cà phê & Trà', slug: 'coffee-tea', icon: 'cafe-outline', order: 1 },
    { name: 'Ẩm thực & Nhà hàng', slug: 'food-dining', icon: 'restaurant-outline', order: 2 },
    { name: 'Giải trí & Phim ảnh', slug: 'entertainment', icon: 'film-outline', order: 3 },
    { name: 'Công nghệ & Thiết bị', slug: 'tech-gadgets', icon: 'laptop-outline', order: 4 },
    { name: 'Làm đẹp & Spa', slug: 'beauty-spa', icon: 'sparkles-outline', order: 5 },
    { name: 'Du lịch & Khách sạn', slug: 'travel-hotel', icon: 'airplane-outline', order: 6 },
    { name: 'Bách hóa & Tiêu dùng', slug: 'groceries', icon: 'cart-outline', order: 7 },
    { name: 'Thể thao & Thể hình', slug: 'fitness', icon: 'barbell-outline', order: 8 }
  ];

  const createdCategories = await Category.insertMany(categoriesData);
  const catMap = createdCategories.reduce((acc, cat) => {
    acc[cat.slug] = cat._id;
    return acc;
  }, {});

  // 4. Khởi tạo Thương hiệu (Brands)
  console.log('4. Khởi tạo 6 thương hiệu chuẩn mã 2 chữ cái...');
  const brandsData = [
    {
      name: 'Starbucks Coffee',
      code: 'SB',
      categoryId: catMap['coffee-tea'],
      rating: 4.9,
      logo_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&auto=format&fit=crop&q=80',
      cover_image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
      description: 'Thương hiệu cà phê đặc sản hàng đầu thế giới, đồ uống pha chế thủ công và bánh tươi mỗi ngày.',
      status: 'active'
    },
    {
      name: 'Shake Shack',
      code: 'SS',
      categoryId: catMap['food-dining'],
      rating: 4.8,
      logo_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
      cover_image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
      description: 'Burger bò Angus thượng hạng, khoai tây chiên giòn rụm và kem tươi Shake Shack trứ danh phong cách New York.',
      status: 'active'
    },
    {
      name: 'AMC Theatres',
      code: 'AT',
      categoryId: catMap['entertainment'],
      rating: 4.7,
      logo_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&auto=format&fit=crop&q=80',
      cover_image_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
      description: 'Hệ thống rạp chiếu phim hiện đại chuẩn IMAX, Dolby Cinema và bắp rang bơ cao cấp.',
      status: 'active'
    },
    {
      name: 'Spotify Premium',
      code: 'SF',
      categoryId: catMap['entertainment'],
      rating: 4.9,
      logo_url: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=200&auto=format&fit=crop&q=80',
      cover_image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      description: 'Dịch vụ nghe nhạc trực tuyến không giới hạn, âm thanh lossless chất lượng cao không bị làm phiền bởi quảng cáo.',
      status: 'active'
    },
    {
      name: 'Apple Store',
      code: 'AP',
      categoryId: catMap['tech-gadgets'],
      rating: 4.9,
      logo_url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&auto=format&fit=crop&q=80',
      cover_image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
      description: 'Hệ sinh thái công nghệ đỉnh cao iPhone, Mac, iPad, AirPods và phụ kiện chính hãng toàn cầu.',
      status: 'active'
    },
    {
      name: 'Sephora Beauty',
      code: 'SP',
      categoryId: catMap['beauty-spa'],
      rating: 4.8,
      logo_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&auto=format&fit=crop&q=80',
      cover_image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80',
      description: 'Thiên đường mỹ phẩm và chăm sóc sắc đẹp chính hãng từ hàng trăm thương hiệu mỹ phẩm xa xỉ.',
      status: 'active'
    }
  ];

  const createdBrands = await Brand.insertMany(brandsData);
  const brandMap = createdBrands.reduce((acc, brand) => {
    acc[brand.code] = brand;
    return acc;
  }, {});

  // 5. Khởi tạo danh sách Voucher
  console.log('5. Khởi tạo các chương trình ưu đãi Voucher hấp dẫn...');
  const nextYear = new Date('2027-06-30T23:59:59.000Z');

  const vouchersData = [
    {
      brandId: brandMap['SB']._id,
      categoryId: catMap['coffee-tea'],
      managerId: manager._id,
      title: 'Giảm 50% Toàn Bộ Menu Đồ Uống Mùa Thu',
      description: 'Áp dụng cho mọi cỡ ly Frappuccino, Cà phê pha máy và Trà Teavana đặc biệt tại các cửa hàng trên toàn quốc.',
      discountType: 'PERCENTAGE',
      discountValue: 50,
      discountDisplay: '50% OFF',
      sellingPrice: 45000,
      originalValue: 90000,
      totalQuantity: 100,
      availableQuantity: 94,
      expirationDate: nextYear,
      termsAndConditions: [
        'Áp dụng tại tất cả các cửa hàng Starbucks Việt Nam.',
        'Mỗi voucher có giá trị sử dụng 01 lần duy nhất.',
        'Áp dụng cho 01 ly nước bất kỳ trên hóa đơn.',
        'Không quy đổi thành tiền mặt hoặc hoàn lại tiền thừa.'
      ],
      coverImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
      thumbnail_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&fit=crop&q=80',
      status: 'ACTIVE'
    },
    {
      brandId: brandMap['SB']._id,
      categoryId: catMap['coffee-tea'],
      managerId: manager._id,
      title: 'Voucher Mua 1 Tặng 1 Cà Phê Cold Brew',
      description: 'Tận hưởng hương vị sảng khoái mát lạnh của dòng Cold Brew ủ chậm 20 tiếng trứ danh.',
      discountType: 'FIXED',
      discountValue: 80,
      discountDisplay: 'BOGO FREE',
      sellingPrice: 35000,
      originalValue: 120000,
      totalQuantity: 60,
      availableQuantity: 58,
      expirationDate: nextYear,
      termsAndConditions: [
        'Mua 01 ly Cold Brew bất kỳ tặng 01 ly cùng size hoặc size nhỏ hơn.',
        'Áp dụng từ thứ 2 đến thứ 6 hàng tuần.'
      ],
      coverImage: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&auto=format&fit=crop&q=80',
      thumbnail_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&auto=format&fit=crop&q=80',
      status: 'ACTIVE'
    },
    {
      brandId: brandMap['SS']._id,
      categoryId: catMap['food-dining'],
      managerId: manager._id,
      title: 'Giảm 40% ShackBurger Kèm Khoai Tây Chiên Lượn Sóng',
      description: 'Combo bữa ăn chuẩn New York với burger bò mềm mọng sốt ShackSauce bí truyền và khoai tây giòn.',
      discountType: 'PERCENTAGE',
      discountValue: 40,
      discountDisplay: '40% OFF',
      sellingPrice: 75000,
      originalValue: 125000,
      totalQuantity: 80,
      availableQuantity: 74,
      expirationDate: nextYear,
      termsAndConditions: [
        'Áp dụng dùng tại chỗ hoặc mang đi tại tất cả chi nhánh.',
        'Không áp dụng chung với các combo ưu đãi giờ vàng khác.'
      ],
      coverImage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
      thumbnail_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&auto=format&fit=crop&q=80',
      status: 'ACTIVE'
    },
    {
      brandId: brandMap['AT']._id,
      categoryId: catMap['entertainment'],
      managerId: manager._id,
      title: 'Vé Xem Phim 2D/3D Bom Tấn Kèm Bắp Rang Lớn',
      description: 'Trải nghiệm rạp chiếu phim chất lượng màn ảnh rộng cho mọi suất chiếu bất kể ngày lễ hay cuối tuần.',
      discountType: 'PERCENTAGE',
      discountValue: 45,
      discountDisplay: '45% OFF',
      sellingPrice: 85000,
      originalValue: 155000,
      totalQuantity: 150,
      availableQuantity: 140,
      expirationDate: nextYear,
      termsAndConditions: [
        'Áp dụng đặt vé xem phim định dạng 2D hoặc 3D tiêu chuẩn.',
        'Đổi vé trực tiếp tại quầy hoặc ứng dụng AMC.'
      ],
      coverImage: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
      thumbnail_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&auto=format&fit=crop&q=80',
      status: 'ACTIVE'
    },
    {
      brandId: brandMap['SF']._id,
      categoryId: catMap['entertainment'],
      managerId: manager._id,
      title: 'Tặng 03 Tháng Spotify Premium Nghe Nhạc Bản Quyền',
      description: 'Nghe nhạc ngoại tuyến không giới hạn, chất lượng âm thanh 320kbps không quảng cáo.',
      discountType: 'PERCENTAGE',
      discountValue: 60,
      discountDisplay: '60% OFF',
      sellingPrice: 59000,
      originalValue: 177000,
      totalQuantity: 200,
      availableQuantity: 185,
      expirationDate: nextYear,
      termsAndConditions: [
        'Mỗi tài khoản Spotify chỉ được kích hoạt mã 01 lần.',
        'Áp dụng cho người dùng đăng ký gói Individual.'
      ],
      coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      thumbnail_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
      status: 'ACTIVE'
    },
    {
      brandId: brandMap['AP']._id,
      categoryId: catMap['tech-gadgets'],
      managerId: manager._id,
      title: 'Giảm 500.000đ Khi Mua Phụ Kiện AirPods & Củ Sạc Nhanh',
      description: 'Áp dụng khi mua phụ kiện chính hãng Apple tại các cửa hàng ủy quyền hoặc website chính thức.',
      discountType: 'FIXED',
      discountValue: 30,
      discountDisplay: '500K OFF',
      sellingPrice: 150000,
      originalValue: 650000,
      totalQuantity: 50,
      availableQuantity: 46,
      expirationDate: nextYear,
      termsAndConditions: [
        'Áp dụng cho đơn hàng phụ kiện từ 1.500.000đ.',
        'Bảo hành chính hãng 12 tháng tại các trung tâm Apple Authorised.'
      ],
      coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
      thumbnail_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&auto=format&fit=crop&q=80',
      status: 'ACTIVE'
    },
    {
      brandId: brandMap['SP']._id,
      categoryId: catMap['beauty-spa'],
      managerId: manager._id,
      title: 'Giảm 35% Toàn Bộ Nước Hoa Cao Cấp & Skincare',
      description: 'Đặc quyền sắm mỹ phẩm cao cấp Tom Ford, Dior, Chanel, Estee Lauder chính hãng.',
      discountType: 'PERCENTAGE',
      discountValue: 35,
      discountDisplay: '35% OFF',
      sellingPrice: 200000,
      originalValue: 550000,
      totalQuantity: 90,
      availableQuantity: 88,
      expirationDate: nextYear,
      termsAndConditions: [
        'Áp dụng cho đơn hàng từ 1.000.000đ.',
        'Tặng kèm túi đựng mỹ phẩm Sephora độc quyền.'
      ],
      coverImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80',
      thumbnail_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&auto=format&fit=crop&q=80',
      status: 'ACTIVE'
    }
  ];

  const createdVouchers = await Voucher.insertMany(vouchersData);

  // 6. Khởi tạo một số Đơn hàng (Orders), UserVoucher và Lượt đổi mã mẫu
  console.log('6. Khởi tạo Đơn hàng mẫu và Lịch sử đổi mã tại quầy...');
  const starbucksVoucher = createdVouchers[0];
  const shakeShackVoucher = createdVouchers[2];
  const amcVoucher = createdVouchers[3];

  // Order 1: Starbucks - Đã thanh toán & đã dùng tại quầy
  const order1 = await Order.create({
    orderCode: 'ORD-94821',
    userId: demoUser._id,
    voucherId: starbucksVoucher._id,
    brandId: brandMap['SB']._id,
    totalAmount: starbucksVoucher.sellingPrice,
    paymentMethod: 'Credit Card',
    status: 'PAID'
  });

  const userVoucher1 = await UserVoucher.create({
    userId: demoUser._id,
    voucherId: starbucksVoucher._id,
    orderId: order1._id,
    orderCode: order1.orderCode,
    voucherCode: 'SB184920',
    is_used: true,
    used_at: new Date(Date.now() - 3600000 * 2), // 2 giờ trước
    expires_at: starbucksVoucher.expirationDate,
    purchased_at: new Date(Date.now() - 86400000)
  });

  order1.walletVoucherId = userVoucher1._id;
  await order1.save();

  // Order 2: Shake Shack - Đã thanh toán & khả dụng trong ví
  const order2 = await Order.create({
    orderCode: 'ORD-71500',
    userId: demoUser._id,
    voucherId: shakeShackVoucher._id,
    brandId: brandMap['SS']._id,
    totalAmount: shakeShackVoucher.sellingPrice,
    paymentMethod: 'MoMo E-Wallet',
    status: 'PAID'
  });

  const userVoucher2 = await UserVoucher.create({
    userId: demoUser._id,
    voucherId: shakeShackVoucher._id,
    orderId: order2._id,
    orderCode: order2.orderCode,
    voucherCode: 'SS829104',
    is_used: false,
    used_at: null,
    expires_at: shakeShackVoucher.expirationDate,
    purchased_at: new Date(Date.now() - 1800000)
  });

  order2.walletVoucherId = userVoucher2._id;
  await order2.save();

  // Order 3: AMC Theatres - Đã thanh toán & đã đổi vé tại rạp
  const order3 = await Order.create({
    orderCode: 'ORD-30219',
    userId: demoUser._id,
    voucherId: amcVoucher._id,
    brandId: brandMap['AT']._id,
    totalAmount: amcVoucher.sellingPrice,
    paymentMethod: 'Credit Card',
    status: 'PAID'
  });

  const userVoucher3 = await UserVoucher.create({
    userId: demoUser._id,
    voucherId: amcVoucher._id,
    orderId: order3._id,
    orderCode: order3.orderCode,
    voucherCode: 'AT994012',
    is_used: true,
    used_at: new Date(Date.now() - 3600000 * 5),
    expires_at: amcVoucher.expirationDate,
    purchased_at: new Date(Date.now() - 86400000 * 2)
  });

  order3.walletVoucherId = userVoucher3._id;
  await order3.save();

  // 7. Khởi tạo Thông báo mẫu cho User
  console.log('7. Khởi tạo thông báo mẫu...');
  await Notification.insertMany([
    {
      userId: demoUser._id,
      type: 'PURCHASE_SUCCESS',
      title: 'Đơn hàng đã được xác nhận! 🎉',
      message: 'Voucher Shake Shack của bạn đã được cấp thành công vào ví voucher.',
      isRead: false,
      actionUrl: '/(user)/wallet'
    },
    {
      userId: demoUser._id,
      type: 'REDEMPTION_CONFIRMED',
      title: 'Đổi voucher tại quầy thành công',
      message: 'Mã voucher SB184920 (Starbucks Coffee) đã được xác thực sử dụng.',
      isRead: true,
      actionUrl: '/(user)/wallet'
    },
    {
      userId: demoUser._id,
      type: 'PROMO',
      title: 'Ưu Đãi Đặc Biệt Mùa Lễ Hội ✨',
      message: 'Hàng ngàn mã giảm giá độc quyền từ Apple và Sephora đã sẵn sàng.',
      isRead: true,
      actionUrl: '/(user)/discover'
    }
  ]);

  console.log('--- HOÀN TẤT SEED DỮ LIỆU THÀNH CÔNG! ---');
  console.log(`- Categories: ${createdCategories.length}`);
  console.log(`- Brands: ${createdBrands.length}`);
  console.log(`- Vouchers: ${createdVouchers.length}`);
  console.log(`- Demo Manager: manager.sarah@brandhub.com / Manager2026! (Role: MANAGER)`);
  console.log(`- Demo User: user.alex@example.com / Voucher2026! (Role: USER)`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Lỗi khi nạp seed data:', err);
  process.exit(1);
});
