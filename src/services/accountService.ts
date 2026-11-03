import { api } from './api';

export const accountService = {
  login: api.login,
  register: api.register,
  me: api.me,
  logout: api.logout,
  changePassword: api.changePassword,
  wallet: api.wallet,
  voucherQr: api.voucherQr,
  createTransferOrder: api.createTransferOrder,
};
