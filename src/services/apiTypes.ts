export interface ApiUser { _id: string; full_name: string; email: string; phone?: string; avatar_url?: string; role: "USER" | "MANAGER"; assignedBrandId?: string | { _id: string } | null; }
export interface AuthResponse { token: string; expires_in: string; }
export interface CategoryDto { _id: string; name: string; slug: string; icon?: string; order?: number; }
export interface BrandDto { _id: string; name: string; code?: string; category?: string; categoryName?: string; logo_url?: string; cover_image_url?: string; description?: string; activeVouchersCount?: number; rating?: number; isFavorite?: boolean; }
export interface VoucherDto {
  _id: string; title: string; description?: string; brand?: { _id: string | null; name: string; logo_url?: string; cover_image_url?: string; rating?: number };
  brandId?: string; brandName?: string; brandLogo?: string; category?: string; categoryId?: string;
  discountType?: "PERCENTAGE" | "FIXED"; discountValue?: number; discountDisplay?: string; sellingPrice?: number;
  originalValue?: number; totalQuantity?: number; availableQuantity?: number; startDate?: string; expirationDate?: string;
  termsAndConditions?: string[]; coverImage?: string; thumbnail_url?: string; status?: string; isFavorite?: boolean;
}
export interface VoucherPageDto { vouchers: VoucherDto[]; total: number; page: number; limit: number; isPersonalized?: boolean; }
export interface WalletVoucherDto {
  _id: string; voucherId: string | null; voucherCode: string; orderCode?: string; title: string; brandName: string;
  brandLogo?: string; discountDisplay?: string; sellingPrice?: number; originalValue?: number; coverImage?: string;
  termsAndConditions?: string[]; status: "AVAILABLE" | "REDEEMED" | "EXPIRED" | "USED"; usedAt?: string | null; expirationDate?: string | null; purchasedDate?: string | null;
}
export interface PurchaseDto { userVoucherId: string; orderCode: string; voucherCode: string; voucherTitle: string; brandName: string; brandLogo: string; totalAmount: number; paymentMethod: string; purchasedDate: string; expirationDate: string; }
export interface FavoriteToggleDto { brandId?: string; voucherId?: string; isFavorite: boolean; message: string; }
