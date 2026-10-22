export type UserRole = 'USER' | 'MANAGER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl: string;
  role: UserRole;
  assignedBrandId?: string; // For manager role
  assignedBrandName?: string;
}

export type VoucherCategory =
  | 'All'
  | 'Food & Dining'
  | 'Coffee & Tea'
  | 'Entertainment'
  | 'Travel & Hotel'
  | 'Tech & Gadgets'
  | 'Beauty & Spa'
  | 'Groceries'
  | 'Fitness';

export interface Brand {
  id: string;
  name: string;
  category: VoucherCategory;
  logo: string;
  coverImage: string;
  description: string;
  voucherCount: number;
  rating: number;
  isFavorite?: boolean;
}

export type VoucherStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ENDED';

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface Voucher {
  id: string;
  brandId: string;
  brandName: string;
  brandLogo: string;
  title: string;
  description: string;
  category: VoucherCategory;
  discountType: DiscountType;
  discountValue: number; // e.g. 50 (for 50%) or 15 (for $15 off)
  discountDisplay: string; // e.g. "50% OFF" or "$15 OFF"
  sellingPrice: number; // e.g. 5.00
  originalValue: number; // e.g. 25.00
  startDate: string;
  expirationDate: string;
  usageConditions: string[];
  totalQuantity: number;
  availableQuantity: number;
  coverImage: string;
  status: VoucherStatus;
  isFavorite?: boolean;
  featured?: boolean;
  trending?: boolean;
  newArrival?: boolean;
}

export type WalletVoucherStatus = 'AVAILABLE' | 'REDEEMED' | 'EXPIRED';

export interface WalletVoucher {
  id: string; // unique wallet voucher id
  voucherId: string; // underlying voucher id
  brandName: string;
  brandLogo: string;
  title: string;
  discountDisplay: string;
  voucherCode: string; // e.g. "MEGA-8492-XQ"
  purchasedDate: string;
  expirationDate: string;
  status: WalletVoucherStatus;
  redeemedDate?: string;
  usageConditions: string[];
  sellingPrice: number;
  originalValue: number;
  coverImage: string;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

export interface Order {
  id: string; // e.g. "ORD-94821"
  voucherId: string;
  voucherTitle: string;
  brandName: string;
  brandLogo: string;
  amount: number;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  walletVoucherId?: string;
}

export type NotificationType =
  | 'PURCHASE_SUCCESS'
  | 'VOUCHER_ISSUED'
  | 'EXPIRATION_REMINDER'
  | 'REDEMPTION_CONFIRMED'
  | 'PROMO';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface ManagerRedemption {
  id: string;
  voucherId: string;
  voucherTitle: string;
  voucherCode: string;
  customerName: string;
  redeemedDate: string;
  status: 'CONFIRMED' | 'FLAGGED';
}

export interface ManagerStats {
  activeVouchers: number;
  totalOrders: number;
  issuedVouchers: number;
  simulatedRedemptions: number;
  totalRevenue: number;
}

export type SortOption =
  | 'popular'
  | 'discount_high'
  | 'price_low'
  | 'price_high'
  | 'expiring_soon';

export interface FilterState {
  category: VoucherCategory;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  onlyAvailable?: boolean;
  searchQuery?: string;
  sortBy?: SortOption;
}
