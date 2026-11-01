export const endpoints = {
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    me: "/api/auth/me",
    logout: "/api/auth/logout",
    changePassword: "/api/auth/change-password",
  },
  categories: "/api/categories",
  brands: "/api/brands",
  brand: (id: string) => `/api/brands/${encodeURIComponent(id)}`,
  vouchers: "/api/vouchers",
  voucher: (id: string) => `/api/vouchers/${encodeURIComponent(id)}`,
  buyVoucher: (id: string) => `/api/vouchers/${encodeURIComponent(id)}/buy`,
  favorites: {
    brands: "/api/favorites/brands",
    brandToggle: (id: string) => `/api/favorites/brands/${encodeURIComponent(id)}/toggle`,
    vouchers: "/api/favorites/vouchers",
    voucherToggle: (id: string) => `/api/favorites/vouchers/${encodeURIComponent(id)}/toggle`,
  },
  wallet: "/api/user-vouchers",
  useVoucher: (id: string) => `/api/user-vouchers/${encodeURIComponent(id)}/use`,
};
