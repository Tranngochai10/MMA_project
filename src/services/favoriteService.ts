import { api } from './api';

export const favoriteService = {
  brands: api.favoriteBrands,
  vouchers: api.favoriteVouchers,
  toggleBrand: api.toggleBrandFavorite,
  toggleVoucher: api.toggleVoucherFavorite,
};
