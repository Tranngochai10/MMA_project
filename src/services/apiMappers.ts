import { VoucherCategory, VoucherStatus } from "../types";
import { ApiUser, BrandDto, VoucherDto, WalletVoucherDto } from "./apiTypes";

const categoryMap: Record<string, string> = {
  "coffee-tea": "Coffee & Tea",
  "ca-phe-tra": "Coffee & Tea",
  "food-dining": "Food & Dining",
  "am-thuc-nha-hang": "Food & Dining",
  entertainment: "Entertainment",
  "giai-tri-phim-anh": "Entertainment",
  "tech-gadgets": "Tech & Gadgets",
  "cong-nghe-thiet-bi": "Tech & Gadgets",
  "beauty-spa": "Beauty & Spa",
  "lam-dep-spa": "Beauty & Spa",
  "travel-hotel": "Travel & Hotel",
  "du-lich-khach-san": "Travel & Hotel",
  groceries: "Groceries",
  "bach-hoa-tieu-dung": "Groceries",
  fitness: "Fitness",
  "the-thao-the-hinh": "Fitness",
};
export const categoryName = (value?: string | { name?: string; slug?: string } | null): VoucherCategory => {
  if (!value) return "All";
  const name = typeof value === "string" ? value : value.name || value.slug || "";
  const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return (categoryMap[slug] || name || "All") as VoucherCategory;
};

export const mapBrand = (item: BrandDto) => ({ id: item._id, salesChannel: item.salesChannel || "STORE" as const, websiteUrl: item.websiteUrl || "", address: item.address || "", name: item.name, category: categoryName(item.categoryName || item.category), logo: item.logo_url || "", coverImage: item.cover_image_url || "", description: item.description || "", voucherCount: item.activeVouchersCount || 0, rating: item.rating || 0, isFavorite: Boolean(item.isFavorite) });
export const mapVoucher = (item: VoucherDto) => ({ id: item._id, brandSalesChannel: item.brand?.salesChannel || item.brandSalesChannel || "STORE" as const, brandWebsiteUrl: item.brand?.websiteUrl || item.brandWebsiteUrl || "", brandAddress: item.brand?.address || "", brandId: item.brand?._id || item.brandId || "", brandName: item.brand?.name || item.brandName || "", brandLogo: item.brand?.logo_url || item.brandLogo || "", title: item.title, description: item.description || "", categoryId: item.categoryId || undefined, category: categoryName(item.category), discountType: item.discountType || "PERCENTAGE", discountValue: item.discountValue ?? item.discountPercent ?? 0, discountDisplay: item.discountDisplay || "", sellingPrice: item.sellingPrice || 0, originalValue: item.originalValue || 0, startDate: item.startDate || "", expirationDate: item.expirationDate || "", usageConditions: item.termsAndConditions || [], totalQuantity: item.totalQuantity ?? item.availableQuantity ?? 0, availableQuantity: item.availableQuantity ?? 0, coverImage: item.coverImage?.trim() || item.thumbnail_url?.trim() || item.brand?.cover_image_url?.trim() || "", status: (item.status || "ACTIVE") as VoucherStatus, isFavorite: Boolean(item.isFavorite) });
export const mapWalletVoucher = (item: WalletVoucherDto) => ({ id: item._id, voucherId: item.voucherId || "", brandName: item.brandName, brandLogo: item.brandLogo || "", title: item.title, discountDisplay: item.discountDisplay || "", voucherCode: item.voucherCode, purchasedDate: item.purchasedDate || "", expirationDate: item.expirationDate || "", status: item.status === "USED" ? "REDEEMED" as const : item.status, redeemedDate: item.usedAt || undefined, usageConditions: item.termsAndConditions || [], sellingPrice: item.sellingPrice || 0, originalValue: item.originalValue || 0, coverImage: item.coverImage || "" });
export const mapUser = (user: ApiUser) => ({ id: user._id, name: user.full_name, email: user.email, phone: user.phone || "", avatarUrl: user.avatar_url || "", role: user.role, assignedBrandId: (typeof user.assignedBrandId === "object" ? user.assignedBrandId?._id : user.assignedBrandId) || undefined });
